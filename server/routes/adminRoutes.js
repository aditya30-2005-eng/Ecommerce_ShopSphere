const express = require('express');
const { getDashboardStats, getUsers } = require('../controllers/adminController');
const {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);

router.route('/promo-codes').get(getPromoCodes).post(createPromoCode);
router.route('/promo-codes/:id').put(updatePromoCode).delete(deletePromoCode);

module.exports = router;
