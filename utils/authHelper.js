class AuthHelper {
  static generateToken(length = 32) {
    return require('crypto').randomBytes(length).toString('hex');
  }

  static hashPassword(password) {
    return require('bcryptjs').hashSync(password, 10);
  }

  static comparePassword(password, hash) {
    return require('bcryptjs').compareSync(password, hash);
  }

  static isAuthenticated(req) {
    return req.user && req.isAuthenticated();
  }

  static isAdmin(req) {
    return req.user && req.user.role === 'admin';
  }
}

module.exports = AuthHelper;
