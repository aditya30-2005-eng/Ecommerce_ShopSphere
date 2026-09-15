const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get aggregate stats for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalOrders, totalUsers, pendingOrders, deliveredOrders, revenueAgg] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      deliveredOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});

// @desc    Get all users (admin overview)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

module.exports = { getDashboardStats, getUsers };
