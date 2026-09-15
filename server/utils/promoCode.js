const PromoCode = require('../models/PromoCode');

/**
 * Validates a promo code against an order subtotal (after product-level
 * discounts, before shipping) and returns the promo document plus the
 * rupee amount to knock off. Throws a descriptive, user-facing error
 * (with statusCode) on anything invalid - the checkout flow always shows
 * *why* a code didn't work instead of silently ignoring it.
 *
 * Used both by the "preview" endpoint (POST /api/promo/apply) and by the
 * real order/payment creation flow, so a shopper can never get a
 * different discount at checkout than what was previewed.
 */
const resolvePromoDiscount = async (code, subtotal) => {
  if (!code) return { promo: null, promoDiscount: 0 };

  const fail = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  };

  const promo = await PromoCode.findOne({ code: String(code).trim().toUpperCase() });
  if (!promo || !promo.isActive) fail('Invalid promo code');
  if (promo.expiresAt && promo.expiresAt < new Date()) fail('This promo code has expired');
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
    fail('This promo code has reached its usage limit');
  }
  if (subtotal < promo.minOrderAmount) {
    fail(`This code needs a minimum order of ₹${promo.minOrderAmount}`);
  }

  let promoDiscount =
    promo.discountType === 'percentage' ? Math.round((subtotal * promo.discountValue) / 100) : promo.discountValue;

  if (promo.discountType === 'percentage' && promo.maxDiscountAmount > 0) {
    promoDiscount = Math.min(promoDiscount, promo.maxDiscountAmount);
  }
  promoDiscount = Math.min(promoDiscount, subtotal); // never discount more than the order is worth

  return { promo, promoDiscount };
};

module.exports = { resolvePromoDiscount };
