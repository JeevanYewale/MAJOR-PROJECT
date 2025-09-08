
  require("dotenv").config();







const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ejsMate = require("ejs-mate");

const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync");
const { listingSchema, reviewSchema } = require("./schemas.js");

// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/users.js");

const app = express();

// ----- Database Connection -----
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on("error", err => {
  console.error("❌ Mongo connection error:", err);
});
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB Connected");
});

// ----- View Engine Setup -----
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----- Middleware -----
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// Serve uploaded files (important for images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----- Session and Flash -----
const sessionConfig = {
  secret: "mysupersecretcode", 
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 3600000, // 7 days
    maxAge: 7 * 24 * 3600000
  }
};
app.use(session(sessionConfig));
app.use(flash());

// ----- Passport Setup -----
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // User.authenticate from passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----- Global Template Variables -----
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ----- Routes -----
app.use("/", userRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/about", (req, res) => {
  res.render("listings/about", { showNavbar: true });
});

app.get("/contact", (req, res) => {
  res.render("listings/contact", { showNavbar: true });
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  console.log("Contact form submitted:", { name, email, message });
  // You can save contact submissions to DB if needed
  req.flash("success", "Thank you for contacting us!");
  res.redirect("/contact");
});

// ----- Error Handling -----
app.use((err, req, res, next) => {
  console.error("=== GLOBAL ERROR ===");
  console.error(err);
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("error", { err: { status, message } });
});

app.use((req, res) => {
  res.status(404).render("error", { err: { status: 404, message: "Page Not Found" } });
});

// ----- Start Server -----
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 TravelStay running on http://localhost:${PORT}`);
});
