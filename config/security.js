module.exports = {
  contentSecurityPolicy: false,
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  xssFilter: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};
