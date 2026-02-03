module.exports = {
  secret: process.env.SESSION_SECRET || 'mysupersecretcode',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: Date.now() + 7 * 24 * 3600000,
    maxAge: 7 * 24 * 3600000
  }
};
