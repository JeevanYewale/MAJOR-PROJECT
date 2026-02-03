const fs = require('fs');
const path = require('path');

const errorDir = path.join(__dirname, '../logs');
if (!fs.existsSync(errorDir)) {
  fs.mkdirSync(errorDir);
}

class ErrorTracker {
  static logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      message: error.message,
      stack: error.stack,
      context
    };

    fs.appendFile(
      path.join(errorDir, 'errors.log'),
      JSON.stringify(errorLog) + '\n',
      (err) => {
        if (err) console.error('Error logging failed:', err);
      }
    );
  }

  static getErrors(limit = 100) {
    try {
      const data = fs.readFileSync(path.join(errorDir, 'errors.log'), 'utf8');
      return data.split('\n').filter(Boolean).slice(-limit).map(JSON.parse);
    } catch (err) {
      return [];
    }
  }
}

module.exports = ErrorTracker;
