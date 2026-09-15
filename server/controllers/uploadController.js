const asyncHandler = require('express-async-handler');

// @desc    Upload one or more product images and return their public URLs
// @route   POST /api/upload
// @access  Private/Admin
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please select at least one image to upload');
  }

  const urls = req.files.map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);

  res.status(201).json({ success: true, urls });
});

module.exports = { uploadImages };
