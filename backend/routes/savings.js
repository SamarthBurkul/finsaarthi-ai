const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const savingsController = require('../controllers/savingsController');

// Protect all routes with authentication
router.use(authMiddleware);

// ==================== SAVINGS STATE ROUTES ====================
router.get('/state', savingsController.getSavingsState);
router.put('/state', savingsController.updateSavingsState);

// ==================== SAVE TODAY ROUTE ====================
router.post('/save-today', savingsController.saveToday);

// ==================== SAVING LOGS ROUTES ====================
router.get('/logs', savingsController.getSavingLogs);

// ==================== PROJECTIONS ROUTE ====================
router.get('/projections', savingsController.getProjections);

// ==================== LIFE GOALS ROUTES ====================
router.get('/goals', savingsController.getAllGoals);
router.post('/goals', savingsController.createGoal);
router.put('/goals/:id', savingsController.updateGoal);
router.delete('/goals/:id', savingsController.deleteGoal);

// ==================== DASHBOARD SUMMARY ====================
router.get('/dashboard', savingsController.getDashboardSummary);

// ==================== AI ANALYSIS ROUTE ====================
router.get('/ai-analysis', savingsController.getAIAnalysis);

module.exports = router;
