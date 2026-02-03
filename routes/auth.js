const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.authType = 'google';
      user.verifications.email = true;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      username: profile.emails[0].value,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      authType: 'google',
      verifications: { email: true },
      verificationLevel: 'email'
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    if (profile.emails && profile.emails[0]) {
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        user.facebookId = profile.id;
        user.authType = 'facebook';
        user.verifications.email = true;
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    user = new User({
      facebookId: profile.id,
      username: profile.emails ? profile.emails[0].value : `fb_${profile.id}`,
      email: profile.emails ? profile.emails[0].value : null,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      authType: 'facebook',
      verifications: { email: !!profile.emails },
      verificationLevel: profile.emails ? 'email' : 'basic'
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/users/login' }),
  (req, res) => {
    req.flash('success', 'Successfully signed in with Google!');
    res.redirect('/');
  }
);

// Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email'] 
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/users/login' }),
  (req, res) => {
    req.flash('success', 'Successfully signed in with Facebook!');
    res.redirect('/');
  }
);

// Phone OTP Login
router.post('/phone/send-otp', wrapAsync(async (req, res) => {
  const { phone, countryCode } = req.body;
  const fullPhone = countryCode + phone;
  
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  
  // Store OTP in session (in production, use Redis or database)
  req.session.phoneOTP = {
    phone: fullPhone,
    otp: otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  };
  
  // Send SMS (implement with Twilio, AWS SNS, etc.)
  console.log(`OTP for ${fullPhone}: ${otp}`);
  
  res.json({ success: true, message: 'OTP sent successfully' });
}));

router.post('/phone/verify-otp', wrapAsync(async (req, res) => {
  const { phone, countryCode, otp } = req.body;
  const fullPhone = countryCode + phone;
  
  const storedOTP = req.session.phoneOTP;
  
  if (!storedOTP || storedOTP.phone !== fullPhone || storedOTP.otp != otp || Date.now() > storedOTP.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  
  // Find or create user
  let user = await User.findOne({ phone: fullPhone });
  
  if (!user) {
    user = new User({
      username: fullPhone,
      phone: fullPhone,
      authType: 'phone',
      verifications: { phone: true },
      verificationLevel: 'phone'
    });
    await user.save();
  } else {
    user.verifications.phone = true;
    user.verificationLevel = 'phone';
    await user.save();
  }
  
  // Login user
  req.login(user, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }
    
    delete req.session.phoneOTP;
    req.flash('success', 'Successfully signed in with phone!');
    res.json({ success: true, redirect: '/' });
  });
}));

// Magic Link Login
router.post('/magic-link', wrapAsync(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Generate magic link token
  const token = require('crypto').randomBytes(32).toString('hex');
  
  user.security.passwordResetToken = token;
  user.security.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();
  
  // Send magic link email (implement with nodemailer)
  const magicLink = `${req.protocol}://${req.get('host')}/auth/magic-link/verify?token=${token}`;
  console.log(`Magic link for ${email}: ${magicLink}`);
  
  res.json({ success: true, message: 'Magic link sent to your email' });
}));

router.get('/magic-link/verify', wrapAsync(async (req, res) => {
  const { token } = req.query;
  
  const user = await User.findOne({
    'security.passwordResetToken': token,
    'security.passwordResetExpires': { $gt: Date.now() }
  });
  
  if (!user) {
    req.flash('error', 'Invalid or expired magic link');
    return res.redirect('/users/login');
  }
  
  // Clear token
  user.security.passwordResetToken = undefined;
  user.security.passwordResetExpires = undefined;
  user.authType = 'magic-link';
  await user.save();
  
  // Login user
  req.login(user, (err) => {
    if (err) {
      req.flash('error', 'Login failed');
      return res.redirect('/users/login');
    }
    
    req.flash('success', 'Successfully signed in with magic link!');
    res.redirect('/');
  });
}));

module.exports = router;