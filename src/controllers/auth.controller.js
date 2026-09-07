const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');
const User = require('../models/User');


const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password });
  res.status(201).json(new ApiResponse(201, { user, token }, 'Account created successfully'));
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });
  res.status(200).json(new ApiResponse(200, { user, token }, 'Logged in successfully'));
});


const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});


const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user.toSafeObject(), 'Current user retrieved'));
});


const updateMe = asyncHandler(async (req, res) => {
  const { name, currency } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (currency !== undefined) updates.currency = currency;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json(new ApiResponse(200, user.toSafeObject(), 'Profile updated'));
});


const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = { register, login, logout, getMe, updateMe, changePassword };
