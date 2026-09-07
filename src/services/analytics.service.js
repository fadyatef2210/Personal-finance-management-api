const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const { ObjectId } = mongoose.Types;


const getSummary = async (userId, { startDate, endDate } = {}) => {
  const match = { user: new ObjectId(userId) };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const results = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const totals = { income: 0, expense: 0 };
  const counts = { income: 0, expense: 0 };
  results.forEach((r) => {
    totals[r._id] = r.total;
    counts[r._id] = r.count;
  });

  const totalIncome = round2(totals.income);
  const totalExpenses = round2(totals.expense);
  const balance = round2(totalIncome - totalExpenses);
  const savingsPercentage = totalIncome > 0 ? round2((balance / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsPercentage,
    transactionCount: {
      income: counts.income,
      expense: counts.expense,
      total: counts.income + counts.expense,
    },
  };
};


const getCategoryDistribution = async (userId, { type = 'expense', month, year, limit = 10 } = {}) => {
  const match = { user: new ObjectId(userId), type };
  if (month && year) {
    const { start, end } = monthRange(month, year);
    match.date = { $gte: start, $lte: end };
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
        total: 1,
        count: 1,
      },
    },
  ];

  const distribution = await Transaction.aggregate(pipeline);
  const grandTotal = distribution.reduce((sum, d) => sum + d.total, 0);

  return distribution.map((d) => ({
    ...d,
    total: round2(d.total),
    percentage: grandTotal > 0 ? round2((d.total / grandTotal) * 100) : 0,
  }));
};


const getMonthlyTrend = async (userId, { months = 6 } = {}) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (months - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { user: new ObjectId(userId), date: { $gte: startDate } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];

  const raw = await Transaction.aggregate(pipeline);

  const byMonth = new Map();
  raw.forEach((r) => {
    const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
    if (!byMonth.has(key)) {
      byMonth.set(key, { period: key, income: 0, expense: 0 });
    }
    byMonth.get(key)[r._id.type] = round2(r.total);
  });

  return Array.from(byMonth.values()).map((m) => ({
    ...m,
    balance: round2(m.income - m.expense),
  }));
};


const getBudgetUsage = async (userId, { month, year }) => {
  const { start, end } = monthRange(month, year);
  const userObjectId = new ObjectId(userId);

  const [budgets, categorySpend, totalExpenseAgg] = await Promise.all([
    Budget.find({ user: userId, month: Number(month), year: Number(year) }).populate('category', 'name'),
    Transaction.aggregate([
      { $match: { user: userObjectId, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { user: userObjectId, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const spendByCategory = new Map(categorySpend.map((c) => [String(c._id), c.total]));
  const totalExpense = totalExpenseAgg[0]?.total || 0;

  return budgets.map((b) => {
    const spent = b.category ? spendByCategory.get(String(b.category._id)) || 0 : totalExpense;
    const usagePercentage = b.limitAmount > 0 ? round2((spent / b.limitAmount) * 100) : 0;

    return {
      budgetId: b._id,
      category: b.category ? b.category.name : 'Overall',
      limitAmount: round2(b.limitAmount),
      spent: round2(spent),
      remaining: round2(b.limitAmount - spent),
      usagePercentage,
      isOverBudget: spent > b.limitAmount,
    };
  });
};


const getDashboard = async (userId) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [summary, monthlySummary, topCategories, budgetUsage, trend] = await Promise.all([
    getSummary(userId),
    getSummary(userId, { startDate: monthRange(month, year).start, endDate: monthRange(month, year).end }),
    getCategoryDistribution(userId, { type: 'expense', month, year, limit: 5 }),
    getBudgetUsage(userId, { month, year }),
    getMonthlyTrend(userId, { months: 6 }),
  ]);

  return {
    allTime: summary,
    currentMonth: { month, year, ...monthlySummary },
    topSpendingCategories: topCategories,
    budgetUsage,
    monthlyTrend: trend,
  };
};



function monthRange(month, year) {
  const start = new Date(Date.UTC(Number(year), Number(month) - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999));
  return { start, end };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = {
  getSummary,
  getCategoryDistribution,
  getMonthlyTrend,
  getBudgetUsage,
  getDashboard,
  monthRange,
};
