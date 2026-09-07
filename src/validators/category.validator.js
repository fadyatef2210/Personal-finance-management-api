const VALID_TYPES = ['income', 'expense'];

const validateCreateCategory = (req) => {
  const { name, type } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Category name is required' });
  }
  if (!type || !VALID_TYPES.includes(type)) {
    errors.push({ field: 'type', message: 'Type must be either "income" or "expense"' });
  }

  return errors;
};

const validateUpdateCategory = (req) => {
  const { name, type } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.push({ field: 'name', message: 'Category name cannot be empty' });
  }
  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push({ field: 'type', message: 'Type must be either "income" or "expense"' });
  }

  return errors;
};

module.exports = { validateCreateCategory, validateUpdateCategory };
