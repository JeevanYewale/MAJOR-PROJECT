const fs = require('fs');
const path = require('path');

class FileHelper {
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  static readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  static writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  static deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static getFileSize(filePath) {
    return fs.statSync(filePath).size;
  }

  static getFileExtension(filePath) {
    return path.extname(filePath);
  }
}

module.exports = FileHelper;
