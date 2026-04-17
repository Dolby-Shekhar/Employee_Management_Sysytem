const errorHandler = (err, req, res, next) => {
  // Hide stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete err.stack;
  }

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value: ${Object.keys(err.keyValue).join(', ')}`;
    error = { statusCode: 400, message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { statusCode: 401, message: 'Invalid token' };
  }
  if (err.name === 'TokenExpiredError') {
    error = { statusCode: 401, message: 'Token expired' };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
