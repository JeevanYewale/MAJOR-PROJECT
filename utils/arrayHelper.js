class ArrayHelper {
  static unique(arr) {
    return [...new Set(arr)];
  }

  static flatten(arr) {
    return arr.reduce((flat, item) => flat.concat(Array.isArray(item) ? this.flatten(item) : item), []);
  }

  static chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  static shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  static groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  static findDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) !== index);
  }
}

module.exports = ArrayHelper;
