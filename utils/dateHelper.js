class DateHelper {
  static formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  static formatDateTime(date) {
    return new Date(date).toLocaleString();
  }

  static getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  static isToday(date) {
    const today = new Date();
    return new Date(date).toDateString() === today.toDateString();
  }

  static getMonthName(date) {
    return new Date(date).toLocaleString('default', { month: 'long' });
  }
}

module.exports = DateHelper;
