const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    fs.appendFileSync(filename, content);
  }

  info(message, meta = {}) {
    const logEntry = this.formatMessage('INFO', message, meta);
    console.log(`[INFO] ${message}`, meta);
    this.writeToFile(this.logFile, logEntry);
  }

  warn(message, meta = {}) {
    const logEntry = this.formatMessage('WARN', message, meta);
    console.warn(`[WARN] ${message}`, meta);
    this.writeToFile(this.logFile, logEntry);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      stack: error?.stack,
      name: error?.name,
      message: error?.message
    };
    const logEntry = this.formatMessage('ERROR', message, errorMeta);
    console.error(`[ERROR] ${message}`, error);
    this.writeToFile(this.errorFile, logEntry);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatMessage('DEBUG', message, meta);
      console.debug(`[DEBUG] ${message}`, meta);
      this.writeToFile(this.logFile, logEntry);
    }
  }
}

module.exports = new Logger();