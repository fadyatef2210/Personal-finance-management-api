const ApiError = require('../utils/ApiError');


const validate = (validatorFn) => (req, res, next) => {
  const errors = validatorFn(req) || [];
  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }
  next();
};

module.exports = validate;
