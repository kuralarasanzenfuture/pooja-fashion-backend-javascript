export const getPaginationParams = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    sortBy: query.sortBy || 'created_at',
    sortOrder: (query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    search: query.search ? query.search.trim() : null,
  };
};

export const formatPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export default {
  getPaginationParams,
  formatPaginationMeta,
};
