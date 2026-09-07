const Transaction = require('../models/Transaction');
const { getPagination, buildMeta } = require('../utils/paginate');


const buildFilter = (userId, query) => {
  const filter = { user: userId };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = Number(query.maxAmount);
  }

  if (query.search) {
    filter.description = { $regex: query.search, $options: 'i' };
  }

  return filter;
};

const listTransactions = async (userId, query) => {
  const filter = buildFilter(userId, query);
  const { page, limit, skip } = getPagination(query);

  const sortField = ['date', 'amount', 'createdAt'].includes(query.sortBy) ? query.sortBy : 'date';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name type icon color')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return { items, meta: buildMeta({ page, limit, total }) };
};

module.exports = { buildFilter, listTransactions };
