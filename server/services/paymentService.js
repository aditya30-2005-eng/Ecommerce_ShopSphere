const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');

// All Razorpay-specific logic lives here so controllers stay thin and the
// payment provider could be swapped out without touching business logic.

/**
 * Creates a Razorpay order for the given amount (in rupees).
 * Razorpay expects the amount in the smallest currency unit (paise).
 */
const createRazorpayOrder = async ({ amount, receipt, notes }) => {
  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
    notes,
  };
  return razorpayInstance.orders.create(options);
};

/**
 * Verifies the HMAC-SHA256 signature Razorpay returns after checkout.
 * This is the step that proves the payment actually happened and was not
 * forged by a malicious client.
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

module.exports = { createRazorpayOrder, verifyPaymentSignature };
