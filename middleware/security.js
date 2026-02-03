// Basic security middleware without external dependencies
const crypto = require('crypto');

// Simple rate limiting
const rateLimitStore = new Map();

const createRateLimit = (windowMs, max, message) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({ error: message });
    }
    
    record.count++;
    next();
  };
};

// General rate limit
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100,
  "Too many requests from this IP, please try again later."
);

// Auth rate limit
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5,
  "Too many authentication attempts, please try again later."
);

// Input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// CSRF protection
const generateCSRFToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Admin access middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  if (req.user.role !== 'admin') {
    req.flash("error", "Admin access required");
    return res.redirect("/");
  }

  next();
};

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const files = req.files ? Object.values(req.files).flat() : [req.file];

  for (let file of files) {
    if (file) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." 
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({ 
          error: "File too large. Maximum size is 5MB." 
        });
      }
    }
  }

  next();
};

// Request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400 || duration > 5000) {
      console.warn(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    }
  });
  
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  sanitizeInput,
  generateCSRFToken,
  requireAdmin,
  validateFileUpload,
  requestLogger
};