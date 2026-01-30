const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

/**
 * Get user's wallet
 * GET /api/wallet
 */
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });

    // Return null instead of 404 when wallet doesn't exist
    // This allows frontend to handle "no wallet yet" state gracefully
    if (!wallet) {
      return res.json({
        success: true,
        wallet: null,
        message: "No wallet found. Create one to get started."
      });
    }

    return res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error("getWallet error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch wallet"
    });
  }
};

/**
 * Create a new wallet for user
 * POST /api/wallet
 */
exports.createWallet = async (req, res) => {
  try {
    const { name, currency, initialBalance } = req.body || {};

    console.log('🔍 createWallet called:', { userId: req.userId, body: req.body });

    // Validate initial balance
    const balance = initialBalance === undefined ? 0 : Number(initialBalance);
    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid initial balance",
        message: "initialBalance must be a non-negative number"
      });
    }

    // Validate currency code (should be 3 letters)
    const walletCurrency = (currency || "INR").toUpperCase();
    if (!/^[A-Z]{3}$/.test(walletCurrency)) {
      return res.status(400).json({
        success: false,
        error: "Invalid currency",
        message: "currency must be a 3-letter code (e.g., INR, USD, EUR)"
      });
    }

    // Atomic upsert to prevent race conditions
    // One wallet per user - if already exists, return existing
    const upsertPayload = {
      userId: req.userId,
      name: name || "Primary Wallet",
      currency: walletCurrency,
      balance,
      status: "active"
    };

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: upsertPayload },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    // Check if this was a new wallet or existing
    const isNew = wallet.balance === balance && wallet.currency === walletCurrency;

    return res.status(200).json({
      success: true,
      wallet,
      isNew,
      message: isNew ? "Wallet created successfully" : "Wallet already exists"
    });
  } catch (error) {
    console.error("createWallet error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create wallet"
    });
  }
};

/**
 * Update wallet settings
 * PATCH /api/wallet
 */
exports.updateWallet = async (req, res) => {
  try {
    const { name, currency, status } = req.body || {};

    const updates = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid name",
          message: "Wallet name cannot be empty"
        });
      }
      updates.name = name.trim();
    }

    if (currency !== undefined) {
      const currencyCode = String(currency).toUpperCase();
      if (!/^[A-Z]{3}$/.test(currencyCode)) {
        return res.status(400).json({
          success: false,
          error: "Invalid currency",
          message: "currency must be a 3-letter code (e.g., INR, USD, EUR)"
        });
      }
      updates.currency = currencyCode;
    }

    if (status !== undefined) {
      if (!['active', 'frozen', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status",
          message: "status must be one of: active, frozen, closed"
        });
      }
      updates.status = status;
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
        message: "No wallet found. Please create a wallet first."
      });
    }

    return res.json({
      success: true,
      wallet,
      message: "Wallet updated successfully"
    });
  } catch (error) {
    console.error("updateWallet error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update wallet"
    });
  }
};

/**
 * Delete wallet (only if no transactions exist)
 * DELETE /api/wallet
 */
exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
        message: "No wallet found to delete"
      });
    }

    // Check if wallet has any transactions
    const txCount = await Transaction.countDocuments({
      walletId: wallet._id,
      userId: req.userId
    });

    if (txCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete wallet with transactions",
        message: `This wallet has ${txCount} transaction(s). Please delete all transactions first or freeze the wallet instead.`
      });
    }

    // Check if wallet has balance
    if (wallet.balance > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete wallet with balance",
        message: `Wallet has a balance of ${wallet.balance} ${wallet.currency}. Please withdraw funds first.`
      });
    }

    await wallet.deleteOne();

    return res.json({
      success: true,
      message: "Wallet deleted successfully"
    });
  } catch (error) {
    console.error("deleteWallet error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete wallet"
    });
  }
};

/**
 * Get wallet statistics
 * GET /api/wallet/stats
 */
exports.getWalletStats = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: "Wallet not found",
        message: "No wallet found"
      });
    }

    // Get transaction summary
    const summary = await Transaction.getSummary(req.userId, wallet._id);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      walletId: wallet._id,
      userId: req.userId
    })
      .sort({ occurredAt: -1 })
      .limit(5)
      .lean();

    return res.json({
      success: true,
      wallet,
      stats: {
        currentBalance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
        ...summary,
        recentTransactions
      }
    });
  } catch (error) {
    console.error("getWalletStats error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch wallet statistics"
    });
  }
};
