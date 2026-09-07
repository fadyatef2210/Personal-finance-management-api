const ApiError = require('../utils/ApiError');


const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};


const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    
    if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid value for field "${error.path}"`);
    }
   
    else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.badRequest('Validation failed', errors);
    }
    
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {}).join(', ');
      error = ApiError.conflict(`Duplicate value for field: ${field}`);
    }
    
    else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Invalid or expired token');
    } else {
      error = ApiError.internal(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      );
    }
  }

  if (process.env.NODE_ENV !== 'production' && error.statusCode === 500) {
    console.error(err.stack);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 ? { errors: error.errors } : {}),
  });
};

module.exports = { notFound, errorHandler };
