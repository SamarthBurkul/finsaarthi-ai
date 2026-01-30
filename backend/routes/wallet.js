// backend/routes/wallet.js
const express = require("express");

const authMiddleware = require("../middleware/auth");
const walletController = require("../controllers/walletController");

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

router.get("/", walletController.getWallet);
router.post("/", walletController.createWallet);
router.patch("/", walletController.updateWallet);
router.delete("/", walletController.deleteWallet);

module.exports = router;
