// Reviews are nested under /api/products/:id/reviews (see productRoutes.js)
// because a review always belongs to a product. This file is kept so the
// route naming in the README/API list has a literal file to point to.
module.exports = require('./productRoutes');
