const Product = require('../models/Product');
const { resolvePromoDiscount } = require('./promoCode');

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 49;

/**
 * Rebuilds order pricing entirely from the database so the frontend can
 * never manipulate prices, discounts or totals. Also validates stock and,
 * if a promo code is supplied, re-validates and applies it server-side -
 * the discount a shopper sees at checkout is always recomputed here, never
 * trusted from the request body.
 * @param {Array<{product: string, quantity: number}>} cartItems
 * @param {string} [promoCodeInput]
 */
const buildOrderPricing = async (cartItems, promoCodeInput) => {
  if (!cartItems || cartItems.length === 0) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  const orderItems = [];
  let itemsPrice = 0;
  let discountAmount = 0;

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.product);
    if (!product) {
      const error = new Error('One of the products in your cart no longer exists');
      error.statusCode = 400;
      throw error;
    }
    if (cartItem.quantity < 1) {
      const error = new Error('Invalid quantity');
      error.statusCode = 400;
      throw error;
    }
    if (product.stock < cartItem.quantity) {
      const error = new Error(`Only ${product.stock} unit(s) of "${product.name}" left in stock`);
      error.statusCode = 400;
      throw error;
    }

    const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsPrice += product.price * cartItem.quantity;
    discountAmount += (product.price - unitPrice) * cartItem.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || 'https://placehold.co/600x600?text=Product',
      price: unitPrice,
      quantity: cartItem.quantity,
    });
  }

  const priceAfterDiscount = itemsPrice - discountAmount;
  const shippingPrice = priceAfterDiscount >= FREE_SHIPPING_THRESHOLD || priceAfterDiscount === 0 ? 0 : SHIPPING_CHARGE;
  const { promo, promoDiscount } = await resolvePromoDiscount(promoCodeInput, priceAfterDiscount);
  const totalAmount = Math.round((priceAfterDiscount + shippingPrice - promoDiscount) * 100) / 100;

  return {
    orderItems,
    itemsPrice,
    discountAmount,
    shippingPrice,
    promoCode: promo ? promo.code : undefined,
    promoDiscount,
    totalAmount,
  };
};

module.exports = { buildOrderPricing, FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE };
