const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, min: 0, default: 0 },
    category: { type: String, required: [true, 'Category is required'], trim: true, index: true },
    brand: { type: String, required: [true, 'Brand is required'], trim: true },
    images: {
      type: [String],
      default: ['https://placehold.co/600x600?text=Product'],
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index powers the keyword search endpoint
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Effective selling price after discount
productSchema.virtual('finalPrice').get(function getFinalPrice() {
  return this.discountPrice && this.discountPrice > 0 ? this.discountPrice : this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
