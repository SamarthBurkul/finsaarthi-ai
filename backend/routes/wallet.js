const express = require("express");
const authMiddleware = require("../middleware/auth");
const walletController = require("../controllers/walletController");

const router = express.Router();

// ============================================
// PROTECTED ROUTES - All require authentication
// ============================================
router.use(authMiddleware);

// Wallet CRUD
router.get("/", walletController.getWallet);
router.post("/", walletController.createWallet);
router.patch("/", walletController.updateWallet);
router.delete("/", walletController.deleteWallet);

// Wallet statistics
router.get("/stats", walletController.getWalletStats);

module.exports = router;
