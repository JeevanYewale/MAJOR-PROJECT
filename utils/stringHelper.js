class StringHelper {
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  static truncate(str, length = 50) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  static removeSpecialChars(str) {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
  }

  static reverseString(str) {
    return str.split('').reverse().join('');
  }

  static countWords(str) {
    return str.trim().split(/\s+/).length;
  }
}

module.exports = StringHelper;
