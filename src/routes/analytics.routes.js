const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/summary', analyticsController.getSummary);
router.get('/category-distribution', analyticsController.getCategoryDistribution);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);
router.get('/dashboard', analyticsController.getDashboard);

module.exports = router;
