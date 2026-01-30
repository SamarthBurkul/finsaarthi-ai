function notFound(req, res, next) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: err?.message || 'Internal Server Error'
  });
}

module.exports = { notFound, errorHandler };
