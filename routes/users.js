const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync");
const users = require("../controllers/users");

// Signup
router.get("/signup", users.renderSignupForm);
router.post("/signup", wrapAsync(users.signup));

// Login
router.get("/login", users.renderLoginForm);
router.post("/login", saveRedirectUrl, passport.authenticate("local", {
  failureRedirect: "/users/login",
  failureFlash: true,
}), users.login);

// Logout
router.get("/logout", users.logout);

// Profile routes
router.get("/profile", isLoggedIn, wrapAsync(users.showProfile));
router.post("/profile", isLoggedIn, wrapAsync(users.updateProfile));

// Dashboard
router.get("/dashboard", isLoggedIn, wrapAsync(users.showDashboard));

// Favorites
router.get("/favorites", isLoggedIn, wrapAsync(users.showFavorites));

module.exports = router;