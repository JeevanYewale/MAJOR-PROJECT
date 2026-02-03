require("dotenv").config();

const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const { connectDB } = require("./config/database");
const sessionConfig = require("./config/session");
const helmetConfig = require("./config/security");
const passport = require("./config/passport");

const wrapAsync = require("./utils/wrapAsync");
const csrfProtection = require("./middleware/csrf");

// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/users.js");
const bookingRouter = require("./routes/booking.js");
const formsRouter = require("./routes/forms.js");
const formStatsRouter = require("./routes/formStats.js");

const app = express();

// Security Middleware
app.use(helmet(helmetConfig));
app.use(mongoSanitize());

// Database Connection
connectDB();

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session and Flash
app.use(session(sessionConfig));
app.use(csrfProtection);
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// Global Template Variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.showNavbar = true;
  next();
});

// Routes
app.get("/", async (req, res) => {
  try {
    const Listing = require("./models/listing");
    const allListings = await Listing.find({}).limit(12);
    console.log(`📋 Found ${allListings.length} listings for homepage`);
    
    // Debug: Log first listing image
    if (allListings.length > 0) {
      console.log(`🖼️ First listing image:`, allListings[0].image);
    }
    
    res.render("listings/enhanced-index", { allListings });
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    res.render("listings/enhanced-index", { allListings: [] });
  }
});

// Search route (before listings router to avoid conflicts)
app.get("/search", async (req, res) => {
  try {
    const Listing = require("./models/listing");
    const { location, category, checkIn, checkOut, guests, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
        { title: { $regex: location, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (guests) {
      const guestCount = parseInt(guests);
      if (isNaN(guestCount) || guestCount < 1) {
        return res.status(400).json({ error: 'Invalid guest count' });
      }
      query.maxGuests = { $gte: guestCount };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (isNaN(min) || min < 0) return res.status(400).json({ error: 'Invalid minimum price' });
        query.price.$gte = min;
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (isNaN(max) || max < 0) return res.status(400).json({ error: 'Invalid maximum price' });
        query.price.$lte = max;
      }
    }
    
    const allListings = await Listing.find(query)
      .populate('owner', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.render("listings/search", { 
      allListings, 
      searchParams: req.query,
      resultsCount: allListings.length
    });
  } catch (error) {
    console.error("Search error:", error);
    req.flash("error", "Search failed");
    res.redirect("/listings");
  }
});

// Static pages
app.get("/about", (req, res) => {
  res.render("listings/about", { title: "About TravelStay" });
});

app.get("/contact", (req, res) => {
  res.render("listings/contact", { title: "Contact Us" });
});

// Auth redirects
app.get("/signup", (req, res) => res.redirect("/users/signup"));
app.get("/login", (req, res) => res.redirect("/users/login"));
app.get("/logout", (req, res) => res.redirect("/users/logout"));

// Router mounting
app.use("/users", userRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/bookings", bookingRouter);
app.use("/forms", formsRouter);
app.use("/form-stats", formStatsRouter);

// Error Handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const { status = 500, message = "Something went wrong!" } = err;
  if (!res.headersSent) {
    res.status(status).render("error", { err: { status, message } });
  }
});

app.use((req, res) => {
  res.status(404).render("error", { err: { status: 404, message: "Page Not Found" } });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 TravelStay running on http://localhost:${PORT}`);
  console.log(`👤 Default login: admin/admin123`);
});