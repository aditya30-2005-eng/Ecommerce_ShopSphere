const mongoose = require('mongoose');

// Store-wide notifications shown to every shopper in the navbar bell menu.
// These are created automatically by the backend whenever something a
// shopper would care about happens (a new product drops, a real discount
// is applied) - never hand-typed fake content.
const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['new-product', 'sale', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
