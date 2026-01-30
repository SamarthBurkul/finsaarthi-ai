// backend/routes/transactions.js
const express = require("express");

const authMiddleware = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getTransactions);
router.get("/:id", transactionController.getTransaction);
router.patch("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
