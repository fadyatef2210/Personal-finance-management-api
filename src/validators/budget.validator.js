const mongoose = require('mongoose');

const validateCreateBudget = (req) => {
  const { category, month, year, limitAmount } = req.body;
  const errors = [];

  if (category !== undefined && category !== null && !mongoose.isValidObjectId(category)) {
    errors.push({ field: 'category', message: 'Category id is invalid' });
  }
  if (!month || !Number.isInteger(Number(month)) || month < 1 || month > 12) {
    errors.push({ field: 'month', message: 'Month is required and must be between 1 and 12' });
  }
  if (!year || !Number.isInteger(Number(year)) || year < 2000) {
    errors.push({ field: 'year', message: 'Year is required and must be 2000 or later' });
  }
  if (limitAmount === undefined || isNaN(limitAmount) || Number(limitAmount) <= 0) {
    errors.push({ field: 'limitAmount', message: 'Limit amount is required and must be greater than 0' });
  }

  return errors;
};

const validateUpdateBudget = (req) => {
  const { month, year, limitAmount } = req.body;
  const errors = [];

  if (month !== undefined && (!Number.isInteger(Number(month)) || month < 1 || month > 12)) {
    errors.push({ field: 'month', message: 'Month must be between 1 and 12' });
  }
  if (year !== undefined && (!Number.isInteger(Number(year)) || year < 2000)) {
    errors.push({ field: 'year', message: 'Year must be 2000 or later' });
  }
  if (limitAmount !== undefined && (isNaN(limitAmount) || Number(limitAmount) <= 0)) {
    errors.push({ field: 'limitAmount', message: 'Limit amount must be greater than 0' });
  }

  return errors;
};

module.exports = { validateCreateBudget, validateUpdateBudget };
