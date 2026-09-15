// Review creation/listing is implemented directly on the product resource
// (see productController: createProductReview / getProductReviews) since
// reviews always belong to exactly one product. This file re-exports them
// so routes/reviewRoutes.js has a conventional home if reviews ever need
// to be queried independently of a product.
module.exports = require('./productController');
