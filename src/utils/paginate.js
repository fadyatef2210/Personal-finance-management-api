/**
 * Parses pagination query params into safe, bounded values.
 * @param {object} query - req.query
 * @param {object} opts - { defaultLimit, maxLimit }
 */
const getPagination = (query, opts = {}) => {
  const defaultLimit = opts.defaultLimit || 10;
  const maxLimit = opts.maxLimit || 100;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds a consistent pagination meta object for list responses.
 */
const buildMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { getPagination, buildMeta };
