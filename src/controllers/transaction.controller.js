const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const transactionService = require('../services/transaction.service');

const assertCategoryBelongsToUser = async (categoryId, userId, expectedType) => {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) {
    throw ApiError.badRequest('Category not found or does not belong to you');
  }
  if (expectedType && category.type !== expectedType) {
    throw ApiError.badRequest(`Category type must match transaction type ("${expectedType}")`);
  }
  return category;
};


const getTransactions = asyncHandler(async (req, res) => {
  const { items, meta } = await transactionService.listTransactions(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, items, 'Transactions retrieved', meta));
});


const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'category',
    'name type icon color'
  );
  if (!transaction) throw ApiError.notFound('Transaction not found');
  res.status(200).json(new ApiResponse(200, transaction, 'Transaction retrieved'));
});


const createTransaction = asyncHandler(async (req, res) => {
  const { type, category, amount, description, date, paymentMethod, tags } = req.body;

  await assertCategoryBelongsToUser(category, req.user._id, type);

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    category,
    amount,
    description,
    date,
    paymentMethod,
    tags,
  });

  res.status(201).json(new ApiResponse(201, transaction, 'Transaction created'));
});


const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) throw ApiError.notFound('Transaction not found');

  const { type, category, amount, description, date, paymentMethod, tags } = req.body;
  const nextType = type !== undefined ? type : transaction.type;

  if (category !== undefined) {
    await assertCategoryBelongsToUser(category, req.user._id, nextType);
    transaction.category = category;
  }
  if (type !== undefined) transaction.type = type;
  if (amount !== undefined) transaction.amount = amount;
  if (description !== undefined) transaction.description = description;
  if (date !== undefined) transaction.date = date;
  if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
  if (tags !== undefined) transaction.tags = tags;

  await transaction.save();
  res.status(200).json(new ApiResponse(200, transaction, 'Transaction updated'));
});


const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!transaction) throw ApiError.notFound('Transaction not found');
  res.status(200).json(new ApiResponse(200, null, 'Transaction deleted'));
});

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
