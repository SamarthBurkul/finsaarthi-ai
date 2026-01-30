const express = require("express");
const authMiddleware = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

// ============================================
// PROTECTED ROUTES - All require authentication
// ============================================
router.use(authMiddleware);

// Transaction CRUD
router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getTransactions);

// Summary/Statistics endpoint (must come before /:id to avoid conflict)
router.get("/summary", transactionController.getTransactionSummary);

// Single transaction operations
router.get("/:id", transactionController.getTransaction);
router.patch("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

// Transaction verification endpoint (audit trail)
router.get("/:id/verify", transactionController.verifyTransaction);

module.exports = router;
