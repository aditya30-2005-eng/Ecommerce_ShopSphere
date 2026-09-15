// Populates the database with demo data:
//   - one admin account, one regular user account
//   - 14 sample products across 5 categories
//
// Usage:
//   npm run seed          -> import demo data
//   npm run seed:destroy  -> wipe products/users (except keeps nothing, full reset)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const PromoCode = require('../models/PromoCode');
const products = require('./products');

const importData = async () => {
  await connectDB();

  await Promise.all([
    Product.deleteMany(),
    User.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
    Notification.deleteMany(),
    PromoCode.deleteMany(),
  ]);

  await PromoCode.create([
    {
      code: 'WELCOME20',
      description: '20% off your first order (max ₹500 off)',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 500,
    },
    {
      code: 'FLAT100',
      description: 'Flat ₹100 off on orders above ₹999',
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 999,
    },
    {
      code: 'SAVE10',
      description: '10% off, no minimum order',
      discountType: 'percentage',
      discountValue: 10,
    },
  ]);

  await User.create([
    { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'Demo Customer', email: 'user@example.com', password: 'user1234', role: 'user' },
  ]);

  const insertedProducts = await Product.insertMany(products);

  // Seed a handful of realistic notifications so the navbar bell isn't
  // empty on a fresh install - mirrors what productController.js creates
  // automatically for real admin actions (new-product / sale).
  const featured = insertedProducts.filter((p) => p.isFeatured).slice(0, 3);
  const discounted = insertedProducts.filter((p) => p.discountPrice > 0).slice(0, 3);

  await Notification.insertMany([
    ...featured.map((p) => ({
      type: 'new-product',
      title: 'New arrival',
      message: `${p.name} just landed in ${p.category}`,
      product: p._id,
    })),
    ...discounted.map((p) => ({
      type: 'sale',
      title: 'Price drop',
      message: `${p.name} is now ${Math.round(((p.price - p.discountPrice) / p.price) * 100)}% off`,
      product: p._id,
    })),
  ]);

  console.log('Demo data imported successfully!');
  console.log('Admin login  -> admin@example.com / admin123');
  console.log('User login   -> user@example.com / user1234');
  console.log('Promo codes  -> WELCOME20 (20% off), FLAT100 (₹100 off ₹999+), SAVE10 (10% off)');
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  await Promise.all([
    Product.deleteMany(),
    User.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
    Notification.deleteMany(),
    PromoCode.deleteMany(),
  ]);
  console.log('All data destroyed!');
  process.exit(0);
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}
