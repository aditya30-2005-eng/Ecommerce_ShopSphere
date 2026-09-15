const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Discount percentage helper, used to detect real markdowns for notifications
const discountPercent = (price, discountPrice) =>
  discountPrice > 0 && price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

// @desc    Get products with search, filter, sort and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
    featured,
    bestSeller,
  } = req.query;

  const filter = {};

  if (keyword) {
    filter.$text = { $search: keyword };
  }
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (featured === 'true') filter.isFeatured = true;
  if (bestSeller === 'true') filter.isBestSeller = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    nameAsc: { name: 1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 12, 1), 50);

  const [products, total, categories, brands] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
    Product.distinct('category'),
    Product.distinct('brand'),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
    filters: { categories, brands },
  });
});

// @desc    Get a single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, stock } = req.body;
  if (!name || !description || price === undefined || !category || !brand || stock === undefined) {
    res.status(400);
    throw new Error('Please provide name, description, price, category, brand and stock');
  }
  if (Number(price) < 0 || Number(stock) < 0) {
    res.status(400);
    throw new Error('Price and stock cannot be negative');
  }

  const product = await Product.create(req.body);

  // Best-effort: let shoppers know a new product just dropped. Never let a
  // notification write fail the actual product-creation request.
  Notification.create({
    type: 'new-product',
    title: 'New arrival',
    message: `${product.name} just landed in ${product.category}`,
    product: product._id,
  }).catch(() => {});

  res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const oldPercent = discountPercent(product.price, product.discountPrice);
  Object.assign(product, req.body);
  const updated = await product.save();
  const newPercent = discountPercent(updated.price, updated.discountPrice);

  // A real markdown just went live (new discount, or a bigger one) - notify shoppers
  if (newPercent > oldPercent) {
    Notification.create({
      type: 'sale',
      title: 'Price drop',
      message: `${updated.name} is now ${newPercent}% off`,
      product: updated._id,
    }).catch(() => {});
  }

  res.json({ success: true, product: updated });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});

// @desc    Create a review for a product (only after a paid purchase)
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please provide a rating and a comment');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const hasPurchased = await Order.exists({
    user: req.user._id,
    paymentStatus: 'Paid',
    'orderItems.product': product._id,
  });
  if (!hasPurchased) {
    res.status(403);
    throw new Error('You can only review products you have purchased');
  }

  await Review.create({
    user: req.user._id,
    product: product._id,
    rating: Number(rating),
    comment,
  });

  const reviews = await Review.find({ product: product._id });
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
};
