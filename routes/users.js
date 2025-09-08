const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const users = require("../controllers/users");

// Signup
router.get("/signup", users.renderSignupForm);
router.post("/signup", users.signup);

// Login
router.get("/login", users.renderLoginForm);
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  users.login
);

// Logout
router.get("/logout", users.logout);

module.exports = router;
