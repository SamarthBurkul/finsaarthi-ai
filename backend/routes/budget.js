// backend/routes/budget.js
const express = require("express");
const router = express.Router();

const { analyzeBudget } = require("../controllers/budgetController");

// If you have an auth middleware, require it. Otherwise, comment it out.
// const auth = require("../middleware/auth");

// Protected route (recommended):
// router.post("/analyze", auth, analyzeBudget);

// For quick local testing without token use:
router.post("/analyze", analyzeBudget);

module.exports = router;
