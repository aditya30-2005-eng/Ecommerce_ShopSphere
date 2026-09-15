const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const PromoCode = require('../models/PromoCode');
const { buildOrderPricing } = require('../utils/pricing');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/paymentService');

// @desc    Create a Razorpay order for the items currently in the cart
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = asyncHandler(async (req, res) => {
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

  // Step 1: recompute the real total from MongoDB - never trust the client.
  // Any promo code is re-validated here too, so the amount actually
  // charged always matches what the discount rules allow.
  const { orderItems, itemsPrice, discountAmount, shippingPrice, promoCode, promoDiscount, totalAmount } =
    await buildOrderPricing(cart.items, req.body.promoCode);

  // Step 2: persist a Pending order first so we always have a record,
  // even if the user abandons the Razorpay checkout modal
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    contactInfo,
    shippingAddress,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Pending',
    itemsPrice,
    discountAmount,
    shippingPrice,
    promoCode,
    promoDiscount,
    totalAmount,
    orderStatus: 'Pending',
  });

  // Step 3: ask Razorpay to create a matching order
  const razorpayOrder = await createRazorpayOrder({
    amount: totalAmount,
    receipt: order._id.toString(),
    notes: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(201).json({
    success: true,
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID, // safe to expose: this is the public key
  });
});

// @desc    Verify a completed Razorpay payment and confirm the order
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing payment verification details');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to verify this order');
  }
  if (order.razorpayOrderId !== razorpay_order_id) {
    res.status(400);
    throw new Error('Order/payment mismatch');
  }

  const isValid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!isValid) {
    order.paymentStatus = 'Failed';
    await order.save();
    res.status(400);
    throw new Error('Payment verification failed - invalid signature');
  }

  // Payment is genuine: finalize the order, drop stock and clear the cart
  order.paymentStatus = 'Paid';
  order.orderStatus = 'Processing';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await order.save();

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Only credit the promo code's usage count once the payment is
  // genuinely confirmed - not at order creation, which could be abandoned.
  if (order.promoCode) {
    await PromoCode.updateOne({ code: order.promoCode }, { $inc: { usedCount: 1 } });
  }

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.json({ success: true, message: 'Payment verified successfully', order });
});

module.exports = { createPaymentOrder, verifyPayment };
