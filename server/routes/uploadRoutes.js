const express = require('express');
const { uploadImages } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

// field name "images" must match FormData.append('images', file) on the client
router.post('/', protect, admin, upload.array('images', 5), uploadImages);

module.exports = router;
