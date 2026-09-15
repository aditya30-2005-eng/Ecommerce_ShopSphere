const express = require('express');
const { applyPromoCode } = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/apply', protect, applyPromoCode);

module.exports = router;
