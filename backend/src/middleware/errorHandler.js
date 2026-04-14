const AppError = require('../utils/AppError');

const notFoundHandler = (_req, _res, next) => {
  next(new AppError('Route not found', 404));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(error.details ? { details: error.details } : {})
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
