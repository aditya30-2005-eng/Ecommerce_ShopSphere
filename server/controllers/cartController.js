const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to load (or lazily create) the current user's cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    return res.json({ success: true, cart: { items: [] } });
  }
  // Drop items whose product was deleted so the UI never crashes
  cart.items = cart.items.filter((item) => item.product);
  res.json({ success: true, cart });
});

// @desc    Add a product to the cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }
  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  const newQuantity = (existingItem ? existingItem.quantity : 0) + Number(quantity);

  if (newQuantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} unit(s) of "${product.name}" left in stock`);
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity) });
  }

  await cart.save();
  await cart.populate('items.product');
  res.status(201).json({ success: true, cart });
});

// @desc    Update the quantity of an item in the cart
// @route   PUT /api/cart/:itemId  (itemId = product id)
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.toString() === req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  const product = await Product.findById(req.params.itemId);
  if (!product) {
    res.status(404);
    throw new Error('Product no longer exists');
  }
  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} unit(s) of "${product.name}" left in stock`);
  }

  item.quantity = Number(quantity);
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:itemId  (itemId = product id)
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.itemId);
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, getOrCreateCart };
