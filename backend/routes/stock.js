const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createStockReport,
  getLatestStockReport,
} = require("../controllers/stockController");

router.use(authMiddleware);

router.post("/report", createStockReport);
router.get("/report/latest", getLatestStockReport);

module.exports = router;


