const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const SavingsGoal = require('../models/SavingsGoal');
const { getPagination, buildMeta } = require('../utils/paginate');


const getGoals = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    SavingsGoal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SavingsGoal.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, items, 'Savings goals retrieved', buildMeta({ page, limit, total })));
});


const getGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  res.status(200).json(new ApiResponse(200, goal, 'Savings goal retrieved'));
});


const createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, deadline } = req.body;
  const goal = await SavingsGoal.create({ user: req.user._id, name, targetAmount, deadline });
  res.status(201).json(new ApiResponse(201, goal, 'Savings goal created'));
});


const updateGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');

  const { name, targetAmount, deadline, status } = req.body;
  if (name !== undefined) goal.name = name;
  if (targetAmount !== undefined) goal.targetAmount = targetAmount;
  if (deadline !== undefined) goal.deadline = deadline;
  if (status !== undefined) goal.status = status;

  await goal.save();
  res.status(200).json(new ApiResponse(200, goal, 'Savings goal updated'));
});


const contributeToGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  if (goal.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot contribute to a goal with status "${goal.status}"`);
  }

  const { amount } = req.body;
  goal.currentAmount += Number(amount);
  await goal.save();

  res.status(200).json(new ApiResponse(200, goal, 'Contribution added'));
});


const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound('Savings goal not found');
  res.status(200).json(new ApiResponse(200, null, 'Savings goal deleted'));
});

module.exports = { getGoals, getGoal, createGoal, updateGoal, contributeToGoal, deleteGoal };
