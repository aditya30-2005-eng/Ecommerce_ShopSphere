// Catches requests to routes that don't exist
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// Centralized error handler. Keeps API error responses consistent and
// never leaks stack traces or internal details in production.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Prefer an explicit err.statusCode (set by utility functions like
  // buildOrderPricing/resolvePromoDiscount that don't have access to
  // `res`) over res.statusCode, which stays 200 unless a controller
  // called res.status() itself before throwing - otherwise those errors
  // silently became 500s instead of the intended 400/403/etc.
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use` : 'Duplicate field value';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Multer upload errors (file too large, too many files, wrong field, etc.)
  if (err.name === 'MulterError' || /only image files are allowed/i.test(message)) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
