const Razorpay = require('razorpay');

// Single shared Razorpay instance built from environment variables.
// The key secret stays on the server and is never sent to the client.
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
