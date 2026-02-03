const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `${timestamp} ${req.method} ${req.path} ${req.ip}\n`;
  
  fs.appendFile(path.join(logDir, 'requests.log'), log, (err) => {
    if (err) console.error('Logging error:', err);
  });
  
  next();
};

module.exports = requestLogger;
