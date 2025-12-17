const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const careerController = require('../controllers/careerController');

// Protect all routes with authentication
router.use(authMiddleware);

// POST /api/career/analyze - Analyze career and get predictions
router.post('/analyze', careerController.analyzeCareer);

// GET /api/career/history - Get analysis history
router.get('/history', careerController.getAnalysisHistory);

// GET /api/career/:id - Get specific analysis
router.get('/:id', careerController.getAnalysis);

module.exports = router;
