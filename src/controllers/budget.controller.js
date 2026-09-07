const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const analyticsService = require('../services/analytics.service');

const getBudgets = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.month) filter.month = Number(req.query.month);
  if (req.query.year) filter.year = Number(req.query.year);

  const budgets = await Budget.find(filter).populate('category', 'name type').sort({ year: -1, month: -1 });
  res.status(200).json(new ApiResponse(200, budgets, 'Budgets retrieved'));
});


const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id }).populate('category', 'name type');
  if (!budget) throw ApiError.notFound('Budget not found');
  res.status(200).json(new ApiResponse(200, budget, 'Budget retrieved'));
});


const createBudget = asyncHandler(async (req, res) => {
  const { category, month, year, limitAmount } = req.body;

  if (category) {
    const cat = await Category.findOne({ _id: category, user: req.user._id, type: 'expense' });
    if (!cat) throw ApiError.badRequest('Category not found or is not an expense category');
  }

  const budget = await Budget.create({
    user: req.user._id,
    category: category || null,
    month,
    year,
    limitAmount,
  });

  res.status(201).json(new ApiResponse(201, budget, 'Budget created'));
});


const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) throw ApiError.notFound('Budget not found');

  const { month, year, limitAmount } = req.body;
  if (month !== undefined) budget.month = month;
  if (year !== undefined) budget.year = year;
  if (limitAmount !== undefined) budget.limitAmount = limitAmount;

  await budget.save();
  res.status(200).json(new ApiResponse(200, budget, 'Budget updated'));
});


const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!budget) throw ApiError.notFound('Budget not found');
  res.status(200).json(new ApiResponse(200, null, 'Budget deleted'));
});


const getBudgetUsage = asyncHandler(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();

  const usage = await analyticsService.getBudgetUsage(req.user._id, { month, year });
  res.status(200).json(new ApiResponse(200, usage, 'Budget usage calculated'));
});

module.exports = { getBudgets, getBudget, createBudget, updateBudget, deleteBudget, getBudgetUsage };
