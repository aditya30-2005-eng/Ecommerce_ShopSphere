const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const PromoCode = require('../models/PromoCode');
const { buildOrderPricing } = require('../utils/pricing');

// @desc    Create a Cash-on-Delivery order directly (no payment gateway)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { contactInfo, shippingAddress } = req.body;
  if (!contactInfo || !shippingAddress) {
    res.status(400);
    throw new Error('Contact info and shipping address are required');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Prices are always recalculated from the database - the client's
  // numbers (and any promo code) are never trusted as-is.
  const { orderItems, itemsPrice, discountAmount, shippingPrice, promoCode, promoDiscount, totalAmount } =
    await buildOrderPricing(cart.items, req.body.promoCode);

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    contactInfo,
    shippingAddress,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    itemsPrice,
    discountAmount,
    shippingPrice,
    promoCode,
    promoDiscount,
    totalAmount,
    orderStatus: 'Processing',
  });

  // Decrement stock and clear the cart
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
  cart.items = [];
  await cart.save();

  // A COD order is confirmed immediately (no payment gateway step), so the
  // promo code's usage count is credited right away.
  if (promoCode) {
    await PromoCode.updateOne({ code: promoCode }, { $inc: { usedCount: 1 } });
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get the logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get a single order
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, order });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, page: pageNum, pages: Math.ceil(total / limitNum) || 1, total });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  if (status === 'Delivered') order.deliveredAt = new Date();
  await order.save();

  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
