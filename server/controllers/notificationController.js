const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get the most recent store notifications (new arrivals, sales...)
// @route   GET /api/notifications
// @access  Public
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(15);
  res.json({ success: true, notifications });
});

module.exports = { getNotifications };
