const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');


const getCategories = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.type) filter.type = req.query.type;

  const categories = await Category.find(filter).sort({ type: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved'));
});


const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) throw ApiError.notFound('Category not found');
  res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
});


const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon, color } = req.body;
  const category = await Category.create({ user: req.user._id, name, type, icon, color });
  res.status(201).json(new ApiResponse(201, category, 'Category created'));
});


const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) throw ApiError.notFound('Category not found');

  const { name, type, icon, color } = req.body;
  if (name !== undefined) category.name = name;
  if (type !== undefined) category.type = type;
  if (icon !== undefined) category.icon = icon;
  if (color !== undefined) category.color = color;

  await category.save();
  res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});


const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) throw ApiError.notFound('Category not found');

  const inUse = await Transaction.exists({ category: category._id });
  if (inUse) {
    throw ApiError.badRequest('Cannot delete a category that has transactions linked to it');
  }
  await Budget.deleteMany({ category: category._id, user: req.user._id });
  await category.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
