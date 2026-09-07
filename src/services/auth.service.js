const User = require('../models/User');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const DEFAULT_EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Other'];
const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];


const seedDefaultCategories = async (userId) => {
  const docs = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({ user: userId, name, type: 'expense', isDefault: true })),
    ...DEFAULT_INCOME_CATEGORIES.map((name) => ({ user: userId, name, type: 'income', isDefault: true })),
  ];
  await Category.insertMany(docs, { ordered: false }).catch(() => {
    
  });
};

const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  await seedDefaultCategories(user._id);

  const token = generateToken(user._id);
  return { user: user.toSafeObject(), token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);
  return { user: user.toSafeObject(), token };
};

module.exports = { registerUser, loginUser, seedDefaultCategories };
