const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const PromoCode = require('../models/PromoCode');
const { resolvePromoDiscount } = require('../utils/promoCode');

// @desc    Validate a promo code against the shopper's current cart and
//          preview the discount (does not create an order or mark the
//          code as used - that only happens once an order is confirmed).
// @route   POST /api/promo/apply
// @access  Private
const applyPromoCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code || !code.trim()) {
    res.status(400);
    throw new Error('Please enter a promo code');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const subtotal = cart.items.reduce((sum, item) => {
    if (!item.product) return sum; // product may have been deleted
    const unitPrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const { promo, promoDiscount } = await resolvePromoDiscount(code, subtotal);

  res.json({
    success: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    promoDiscount,
  });
});

// ---------- Admin management ----------

// @desc    List all promo codes
// @route   GET /api/admin/promo-codes
// @access  Private/Admin
const getPromoCodes = asyncHandler(async (req, res) => {
  const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
  res.json({ success: true, promoCodes });
});

// @desc    Create a promo code
// @route   POST /api/admin/promo-codes
// @access  Private/Admin
const createPromoCode = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    res.status(400);
    throw new Error('Please provide a code, discount type and discount value');
  }
  if (!['percentage', 'flat'].includes(discountType)) {
    res.status(400);
    throw new Error('discountType must be "percentage" or "flat"');
  }
  if (Number(discountValue) <= 0) {
    res.status(400);
    throw new Error('Discount value must be greater than 0');
  }
  if (discountType === 'percentage' && Number(discountValue) > 100) {
    res.status(400);
    throw new Error('Percentage discount cannot exceed 100');
  }

  const promoCode = await PromoCode.create({
    ...req.body,
    code: code.trim().toUpperCase(),
  });
  res.status(201).json({ success: true, promoCode });
});

// @desc    Update a promo code
// @route   PUT /api/admin/promo-codes/:id
// @access  Private/Admin
const updatePromoCode = asyncHandler(async (req, res) => {
  const promoCode = await PromoCode.findById(req.params.id);
  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }
  const updates = { ...req.body };
  if (updates.code) updates.code = updates.code.trim().toUpperCase();
  Object.assign(promoCode, updates);
  const updated = await promoCode.save();
  res.json({ success: true, promoCode: updated });
});

// @desc    Delete a promo code
// @route   DELETE /api/admin/promo-codes/:id
// @access  Private/Admin
const deletePromoCode = asyncHandler(async (req, res) => {
  const promoCode = await PromoCode.findById(req.params.id);
  if (!promoCode) {
    res.status(404);
    throw new Error('Promo code not found');
  }
  await promoCode.deleteOne();
  res.json({ success: true, message: 'Promo code removed' });
});

module.exports = { applyPromoCode, getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode };
