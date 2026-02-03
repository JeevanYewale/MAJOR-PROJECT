class MathHelper {
  static round(num, decimals = 2) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static average(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  static sum(numbers) {
    return numbers.reduce((a, b) => a + b, 0);
  }

  static max(numbers) {
    return Math.max(...numbers);
  }

  static min(numbers) {
    return Math.min(...numbers);
  }

  static percentage(value, total) {
    return this.round((value / total) * 100);
  }

  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = MathHelper;
