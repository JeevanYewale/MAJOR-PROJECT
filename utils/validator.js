class Validator {
  static isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isPhone(phone) {
    return /^[0-9\-\+\(\)\s]{10,}$/.test(phone);
  }

  static isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  static isURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeString(str) {
    return str.trim().replace(/[<>]/g, '');
  }

  static isValidPrice(price) {
    return !isNaN(price) && price > 0;
  }

  static isValidRating(rating) {
    return rating >= 1 && rating <= 5;
  }
}

module.exports = Validator;
