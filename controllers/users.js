const User = require("../models/user");

// Show signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs", { showNavbar: true });
};

// Signup logic
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    console.log("✅ Registered User:", registeredUser);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to WanderLust, " + username + "!");
      res.redirect("/listings");
    });
  } catch (e) {
    console.error("❌ Signup Error:", e.message);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Show login form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs", { showNavbar: true });
};

// Login logic
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back, " + req.user.username + "!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/listings");
  });
};
