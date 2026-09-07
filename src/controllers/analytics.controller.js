const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const analyticsService = require('../services/analytics.service');


const getSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await analyticsService.getSummary(req.user._id, { startDate, endDate });
  res.status(200).json(new ApiResponse(200, summary, 'Financial summary calculated'));
});


const getCategoryDistribution = asyncHandler(async (req, res) => {
  const { type, month, year, limit } = req.query;
  const distribution = await analyticsService.getCategoryDistribution(req.user._id, {
    type: type || 'expense',
    month: month ? Number(month) : undefined,
    year: year ? Number(year) : undefined,
    limit: limit ? Number(limit) : 10,
  });
  res.status(200).json(new ApiResponse(200, distribution, 'Category distribution calculated'));
});


const getMonthlyTrend = asyncHandler(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 6;
  const trend = await analyticsService.getMonthlyTrend(req.user._id, { months });
  res.status(200).json(new ApiResponse(200, trend, 'Monthly trend calculated'));
});


const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await analyticsService.getDashboard(req.user._id);
  res.status(200).json(new ApiResponse(200, dashboard, 'Dashboard data calculated'));
});

module.exports = { getSummary, getCategoryDistribution, getMonthlyTrend, getDashboard };
