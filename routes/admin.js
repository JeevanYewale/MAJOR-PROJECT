const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const wrapAsync = require("../utils/wrapAsync");
const { requireAdmin } = require("../middleware/security");

// Admin dashboard
router.get("/", requireAdmin, wrapAsync(adminController.dashboard));

// User management
router.get("/users", requireAdmin, wrapAsync(adminController.manageUsers));
router.post("/users/:id/toggle-status", requireAdmin, wrapAsync(adminController.toggleUserStatus));
router.delete("/users/:id", requireAdmin, wrapAsync(adminController.deleteUser));

// Listing management
router.get("/listings", requireAdmin, wrapAsync(adminController.manageListings));
router.post("/listings/:id/toggle-status", requireAdmin, wrapAsync(adminController.toggleListingStatus));

// Statistics API
router.get("/api/statistics", requireAdmin, wrapAsync(adminController.getStatistics));

// Analytics
router.get("/analytics", requireAdmin, (req, res) => {
  res.render("admin/analytics");
});

module.exports = router;