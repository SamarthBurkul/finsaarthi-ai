// backend/routes/expenses.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const expenseController = require("../controllers/expenseController");

router.post("/", auth, expenseController.createExpense);
router.get("/", auth, expenseController.getExpenses);
router.delete("/:id", auth, expenseController.deleteExpense);

// Fraud alert endpoints
router.get("/alerts/all", auth, expenseController.getAlerts);
router.get("/flagged/list", auth, expenseController.getFlaggedTransactions);
router.put("/alerts/:alertId/acknowledge", auth, expenseController.acknowledgeAlert);
router.put("/alerts/:alertId/resolve", auth, expenseController.resolveAlert);

module.exports = router;
