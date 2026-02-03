const express = require('express');
const router = express.Router();
const FormStatsService = require('../utils/formStatsService');
const wrapAsync = require('../utils/wrapAsync');

// Get form statistics
router.get('/stats', wrapAsync(async (req, res) => {
  const stats = await FormStatsService.getStats();
  res.json(stats);
}));

// Get submissions by day
router.get('/submissions-by-day', wrapAsync(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await FormStatsService.getSubmissionsByDay(parseInt(days));
  res.json(data);
}));

// Get top subjects
router.get('/top-subjects', wrapAsync(async (req, res) => {
  const { limit = 5 } = req.query;
  const subjects = await FormStatsService.getTopSubjects(parseInt(limit));
  res.json(subjects);
}));

// Get response time
router.get('/response-time', wrapAsync(async (req, res) => {
  const data = await FormStatsService.getResponseTime();
  res.json(data[0] || { avgTime: 0 });
}));

module.exports = router;
