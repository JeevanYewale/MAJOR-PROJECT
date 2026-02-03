const express = require('express');
const router = express.Router();
const AnalyticsService = require('../utils/analyticsService');
const wrapAsync = require('../utils/wrapAsync');

// Dashboard stats
router.get('/dashboard', wrapAsync(async (req, res) => {
  const stats = await AnalyticsService.getDashboardStats();
  res.json(stats);
}));

// Revenue by month
router.get('/revenue', wrapAsync(async (req, res) => {
  const { months = 12 } = req.query;
  const data = await AnalyticsService.getRevenueByMonth(parseInt(months));
  res.json(data);
}));

// Top listings
router.get('/top-listings', wrapAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  const listings = await AnalyticsService.getTopListings(parseInt(limit));
  res.json(listings);
}));

// User growth
router.get('/user-growth', wrapAsync(async (req, res) => {
  const { months = 12 } = req.query;
  const data = await AnalyticsService.getUserGrowth(parseInt(months));
  res.json(data);
}));

// Average rating
router.get('/average-rating', wrapAsync(async (req, res) => {
  const rating = await AnalyticsService.getAverageRating();
  res.json({ averageRating: rating });
}));

module.exports = router;
