// backend/routes/expenses.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const expenseController = require("../controllers/expenseController");

router.post("/", auth, expenseController.createExpense);
router.get("/", auth, expenseController.getExpenses);
router.delete("/:id", auth, expenseController.deleteExpense);

module.exports = router;
