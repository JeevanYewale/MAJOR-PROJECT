class ResponseFormatter {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date()
    };
  }

  static error(message = 'Error', code = 'ERROR') {
    return {
      success: false,
      message,
      code,
      timestamp: new Date()
    };
  }

  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination,
      timestamp: new Date()
    };
  }

  static list(items, total) {
    return {
      success: true,
      items,
      total,
      count: items.length,
      timestamp: new Date()
    };
  }
}

module.exports = ResponseFormatter;
