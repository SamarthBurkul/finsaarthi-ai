// middleware/errorHandler.js

function notFound(req, res, next) {
  res.status(404);
  const err = new Error(`Not Found - ${req.originalUrl}`);
  next(err);
}

// IMPORTANT: 4 args so Express recognizes this as an error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error('ERROR:', err && err.stack ? err.stack : err);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server error'
  });
  // Do not call next() - this is the final error handler
}

module.exports = { notFound, errorHandler };
