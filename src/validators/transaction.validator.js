const mongoose = require('mongoose');

const VALID_TYPES = ['income', 'expense'];
const VALID_PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'wallet', 'other'];

const validateCreateTransaction = (req) => {
  const { type, category, amount, date, paymentMethod, description } = req.body;
  const errors = [];

  if (!type || !VALID_TYPES.includes(type)) {
    errors.push({ field: 'type', message: 'Type must be either "income" or "expense"' });
  }
  if (!category || !mongoose.isValidObjectId(category)) {
    errors.push({ field: 'category', message: 'A valid category id is required' });
  }
  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
    errors.push({ field: 'amount', message: 'Amount is required and must be greater than 0' });
  }
  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.push({ field: 'date', message: 'Date must be a valid date' });
  }
  if (paymentMethod !== undefined && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: `Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
    });
  }
  if (description !== undefined && description.length > 200) {
    errors.push({ field: 'description', message: 'Description must be at most 200 characters' });
  }

  return errors;
};

const validateUpdateTransaction = (req) => {
  const { type, category, amount, date, paymentMethod, description } = req.body;
  const errors = [];

  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push({ field: 'type', message: 'Type must be either "income" or "expense"' });
  }
  if (category !== undefined && !mongoose.isValidObjectId(category)) {
    errors.push({ field: 'category', message: 'Category id is invalid' });
  }
  if (amount !== undefined && (isNaN(amount) || Number(amount) <= 0)) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  }
  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.push({ field: 'date', message: 'Date must be a valid date' });
  }
  if (paymentMethod !== undefined && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: `Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
    });
  }
  if (description !== undefined && description.length > 200) {
    errors.push({ field: 'description', message: 'Description must be at most 200 characters' });
  }

  return errors;
};

module.exports = { validateCreateTransaction, validateUpdateTransaction };
