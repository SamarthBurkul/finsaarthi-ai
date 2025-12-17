const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const investmentController = require('../controllers/investmentController');

// Protect all routes with authentication
router.use(authMiddleware);

// POST /api/investment/compare - Compare investments
router.post('/compare', investmentController.compareInvestments);

// GET /api/investment/history - Get comparison history
router.get('/history', investmentController.getComparisonHistory);

// GET /api/investment/:id - Get specific comparison
router.get('/:id', investmentController.getComparison);

module.exports = router;
