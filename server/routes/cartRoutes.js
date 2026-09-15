const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // every cart route requires a logged-in user

router.route('/').get(getCart).post(addToCart);
router.route('/:itemId').put(updateCartItem).delete(removeCartItem);

module.exports = router;
