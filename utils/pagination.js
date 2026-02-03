class Pagination {
  constructor(page = 1, limit = 12) {
    this.page = Math.max(1, parseInt(page) || 1);
    this.limit = Math.max(1, Math.min(100, parseInt(limit) || 12));
  }

  getSkip() {
    return (this.page - 1) * this.limit;
  }

  getPaginationData(total) {
    return {
      page: this.page,
      limit: this.limit,
      total,
      pages: Math.ceil(total / this.limit),
      hasNext: this.page < Math.ceil(total / this.limit),
      hasPrev: this.page > 1
    };
  }

  getMongooseQuery() {
    return {
      skip: this.getSkip(),
      limit: this.limit
    };
  }
}

module.exports = Pagination;
