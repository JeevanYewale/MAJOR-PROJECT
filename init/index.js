// ------------------- Imports -------------------
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Contact = require("./models/contact.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");

// ------------------- View Engine Setup -------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------- Middleware -------------------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ------------------- MongoDB Connection -------------------
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo connection error:", err));

// ------------------- Helper: Normalize Image -------------------
function normalizeImageInput(payloadImage, payloadImageUrl, existingImage) {
  if (typeof payloadImageUrl === "string" && payloadImageUrl.trim() !== "") {
    return {
      filename: (existingImage && existingImage.filename) || "listingimage",
      url: payloadImageUrl.trim(),
    };
  }
  if (
    payloadImage &&
    typeof payloadImage === "object" &&
    payloadImage.url &&
    payloadImage.url.trim() !== ""
  ) {
    return {
      filename:
        payloadImage.filename ||
        (existingImage && existingImage.filename) ||
        "listingimage",
      url: payloadImage.url.trim(),
    };
  }
  if (typeof payloadImage === "string" && payloadImage.trim() !== "") {
    const s = payloadImage.trim();
    if (/^https?:\/\//i.test(s)) {
      return {
        filename: (existingImage && existingImage.filename) || "listingimage",
        url: s,
      };
    }
    const urlMatch = s.match(/https?:\/\/[^\s'"]+/i);
    if (urlMatch) {
      return {
        filename: (existingImage && existingImage.filename) || "listingimage",
        url: urlMatch[0],
      };
    }
    return existingImage;
  }
  return existingImage;
}

// ------------------- Routes -------------------

// Root
app.get("/", (req, res) => res.redirect("/listings"));

// INDEX - Listings
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// NEW Listing Form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE Listing
app.post(
  "/listings",
  wrapAsync(async (req, res) => {
    const payload = req.body.listing || {};
    const listingData = {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      country: payload.country,
      location: payload.location,
    };
    const maybeImage = normalizeImageInput(
      payload.image,
      payload.imageUrl,
      undefined
    );
    if (maybeImage && maybeImage.url) listingData.image = maybeImage;

    const newListing = new Listing(listingData);
    await newListing.save();

    res.redirect("/listings");
  })
);

// SHOW Listing
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.redirect("/listings");
    res.render("listings/show.ejs", { listing });
  })
);

// EDIT Listing
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.redirect("/listings");
    res.render("listings/edit.ejs", { listing });
  })
);

// UPDATE Listing
app.put(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.redirect("/listings");

    const payload = req.body.listing || {};
    const updated = {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      country: payload.country,
      location: payload.location,
    };

    updated.image = normalizeImageInput(
      payload.image,
      payload.imageUrl,
      listing.image
    );

    await Listing.findByIdAndUpdate(id, updated, {
      runValidators: true,
      new: true,
    });
    res.redirect(`/listings/${id}`);
  })
);

// DELETE Listing
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

// About
app.get("/about", (req, res) => {
  res.render("listings/about", { showNavbar: true });
});

// ------------------- Contact Routes -------------------

// GET Contact Form
app.get("/contact", (req, res) => {
  res.render("listings/contact", { showNavbar: true });
});

// POST Contact Form
app.post("/contact", wrapAsync(async (req, res) => {
  const { name, email, message } = req.body;

  // Save contact to MongoDB
  await Contact.create({ name, email, message });

  // Send response with popup
  res.send(`
    <script>
      alert('Thank you! Your details have been submitted.');
      window.location.href = '/contact';
    </script>
  `);
}));

// ------------------- Global Error Handler -------------------
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).send("Something went wrong on the server!");
});

// ------------------- Start Server -------------------
app.listen(8080, () => {
  console.log("🚀 TravelStay server running on http://localhost:8080");
});
