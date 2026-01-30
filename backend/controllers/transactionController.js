const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { generateTxHash, verifyTxHash, generateAuditLog } = require("../helpers/generateTxHash");

function parseAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function findWalletForUser(userId, walletId) {
  if (walletId) {
    return Wallet.findOne({ _id: walletId, userId });
  }
  return Wallet.findOne({ userId });
}

/**
 * Create a new transaction
 * POST /api/transactions
 */
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletId, type, amount, currency, description, category, status, metadata, occurredAt } = req.body || {};

    // Validate transaction type
    if (!type || !["credit", "debit"].includes(type)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid transaction type",
        message: "type must be one of: credit, debit" 
      });
    }

    // Validate and parse amount
    const amt = parseAmount(amount);
    if (amt === null) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid amount",
        message: "amount must be a positive number greater than 0" 
      });
    }

    // Find user's wallet
    const wallet = await findWalletForUser(userId, walletId);
    if (!wallet) {
      return res.status(404).json({ 
        success: false,
        error: "Wallet not found",
        message: "No wallet found for this user. Please create a wallet first." 
      });
    }

    // Check wallet status
    if (wallet.status !== "active") {
      return res.status(400).json({ 
        success: false,
        error: "Wallet inactive",
        message: `Cannot perform transaction. Wallet status is ${wallet.status}` 
      });
    }

    // For debit transactions, check if sufficient balance exists
    if (type === "debit" && wallet.balance < amt) {
      return res.status(400).json({ 
        success: false,
        error: "Insufficient funds",
        message: `Current balance (${wallet.balance} ${wallet.currency}) is less than transaction amount (${amt} ${currency || wallet.currency})` 
      });
    }

    // Generate transaction timestamp
    const txOccurredAt = occurredAt ? new Date(occurredAt) : new Date();
    
    // Validate timestamp is not in future
    if (txOccurredAt > new Date()) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid timestamp",
        message: "Transaction date cannot be in the future" 
      });
    }

    // Generate tamper-proof transaction hash BEFORE updating wallet
    const txHash = generateTxHash({ 
      userId, 
      walletId: String(wallet._id), 
      type, 
      amt, 
      occurredAt: txOccurredAt 
    });

    // Update wallet balance atomically
    let updatedWallet;
    if (type === "credit") {
      updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, userId, status: "active" },
        { $inc: { balance: amt } },
        { new: true, runValidators: true }
      );

      if (!updatedWallet) {
        return res.status(400).json({ 
          success: false,
          error: "Transaction failed",
          message: "Wallet is not active or was modified during transaction" 
        });
      }
    } else {
      // Debit with balance check (atomic operation)
      updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, userId, status: "active", balance: { $gte: amt } },
        { $inc: { balance: -amt } },
        { new: true, runValidators: true }
      );

      if (!updatedWallet) {
        return res.status(400).json({ 
          success: false,
          error: "Insufficient funds",
          message: "Balance was insufficient or wallet was modified during transaction" 
        });
      }
    }

    // Create transaction record with hash
    try {
      const tx = await Transaction.create({
        userId,
        walletId: wallet._id,
        txHash,
        type,
        amount: amt,
        currency: (currency || updatedWallet.currency || "INR").toUpperCase(),
        description: description || "",
        category: category || "general",
        status: status || "completed",
        metadata: metadata || {},
        occurredAt: txOccurredAt
      });

      // Log audit trail
      const auditLog = generateAuditLog(tx, 'created');
      console.log('📝 Transaction created:', auditLog);

      return res.status(201).json({ 
        success: true,
        transaction: tx, 
        wallet: updatedWallet,
        message: `Transaction successful. ${type === 'credit' ? 'Added' : 'Deducted'} ${amt} ${tx.currency}`
      });
    } catch (txErr) {
      // CRITICAL: Rollback wallet balance if transaction creation fails
      console.error('❌ Transaction creation failed, rolling back balance:', txErr);
      
      try {
        const rollbackInc = type === "credit" ? -amt : amt;
        await Wallet.updateOne(
          { _id: wallet._id, userId }, 
          { $inc: { balance: rollbackInc } }
        );
        console.log('✅ Balance rollback successful');
      } catch (rollbackErr) {
        console.error('🔴 CRITICAL: Balance rollback failed:', rollbackErr);
        // In production, this should trigger an alert/notification system
      }

      throw txErr;
    }
  } catch (error) {
    console.error("createTransaction error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "An error occurred while creating the transaction",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all transactions for authenticated user
 * GET /api/transactions
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletId, type, status, category, from, to, limit = 50, skip = 0 } = req.query || {};

    const query = { userId };
    if (walletId) query.walletId = walletId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category.toLowerCase();

    // Date range filtering
    if (from || to) {
      query.occurredAt = {};
      if (from) query.occurredAt.$gte = new Date(from);
      if (to) query.occurredAt.$lte = new Date(to);
    }

    const parsedLimit = Math.min(200, Math.max(1, Number(limit) || 50));
    const parsedSkip = Math.max(0, Number(skip) || 0);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ occurredAt: -1, _id: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .lean(),
      Transaction.countDocuments(query)
    ]);

    return res.json({ 
      success: true,
      transactions,
      pagination: {
        total,
        limit: parsedLimit,
        skip: parsedSkip,
        hasMore: (parsedSkip + parsedLimit) < total
      }
    });
  } catch (error) {
    console.error("getTransactions error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "Failed to fetch transactions" 
    });
  }
};

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
exports.getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!tx) {
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found",
        message: "No transaction found with this ID" 
      });
    }
    
    return res.json({ 
      success: true,
      transaction: tx 
    });
  } catch (error) {
    console.error("getTransaction error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "Failed to fetch transaction" 
    });
  }
};

/**
 * Verify transaction integrity
 * GET /api/transactions/:id/verify
 */
exports.verifyTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!tx) {
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found",
        message: "No transaction found with this ID" 
      });
    }

    // Verify transaction integrity
    const verification = verifyTxHash(tx);

    // Mark as verified if valid
    if (verification.valid && !tx.isVerified) {
      await tx.markVerified();
    }

    return res.json({ 
      success: true,
      verification,
      transaction: {
        _id: tx._id,
        txHash: tx.txHash,
        type: tx.type,
        amount: tx.amount,
        occurredAt: tx.occurredAt,
        isVerified: tx.isVerified,
        verifiedAt: tx.verifiedAt
      }
    });
  } catch (error) {
    console.error("verifyTransaction error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "Failed to verify transaction" 
    });
  }
};

/**
 * Update transaction metadata
 * PATCH /api/transactions/:id
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { description, category, status, metadata } = req.body || {};

    // Only allow updating certain fields (not amount, type, etc.)
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category.toLowerCase();
    if (status !== undefined) {
      if (!['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid status",
          message: "status must be one of: pending, completed, failed, cancelled" 
        });
      }
      updates.status = status;
    }
    if (metadata !== undefined) updates.metadata = metadata;

    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tx) {
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found",
        message: "No transaction found with this ID" 
      });
    }

    // Log audit trail
    const auditLog = generateAuditLog(tx, 'updated');
    console.log('📝 Transaction updated:', auditLog);

    return res.json({ 
      success: true,
      transaction: tx,
      message: "Transaction updated successfully" 
    });
  } catch (error) {
    console.error("updateTransaction error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "Failed to update transaction" 
    });
  }
};

/**
 * Delete/Reverse a transaction
 * DELETE /api/transactions/:id
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId;

    const tx = await Transaction.findOne({ _id: req.params.id, userId });
    if (!tx) {
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found",
        message: "No transaction found with this ID" 
      });
    }

    // Prevent deletion of already reversed transactions
    if (tx.isReversed) {
      return res.status(400).json({ 
        success: false,
        error: "Already reversed",
        message: "This transaction has already been reversed" 
      });
    }

    // Calculate reverse amount
    const amt = Number(tx.amount) || 0;
    const inc = tx.type === "credit" ? -amt : amt;

    // For credit reversals, ensure wallet has sufficient balance
    if (inc < 0) {
      const wallet = await Wallet.findOne({ _id: tx.walletId, userId });
      if (!wallet) {
        return res.status(404).json({ 
          success: false,
          error: "Wallet not found",
          message: "Associated wallet not found" 
        });
      }
      if (wallet.balance < amt) {
        return res.status(400).json({ 
          success: false,
          error: "Insufficient balance",
          message: "Cannot reverse: wallet balance would go negative" 
        });
      }
    }

    // Update wallet balance
    await Wallet.updateOne(
      { _id: tx.walletId, userId }, 
      { $inc: { balance: inc } }
    );

    // Mark transaction as reversed instead of deleting
    tx.isReversed = true;
    tx.reversedAt = new Date();
    await tx.save();

    // Log audit trail
    const auditLog = generateAuditLog(tx, 'reversed');
    console.log('📝 Transaction reversed:', auditLog);

    return res.json({ 
      success: true,
      message: "Transaction reversed successfully",
      reversedTransaction: tx
    });
  } catch (error) {
    console.error("deleteTransaction error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "Failed to reverse transaction" 
    });
  }
};

/**
 * Get transaction summary/statistics
 * GET /api/transactions/summary
 */
exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletId, from, to } = req.query;

    const summary = await Transaction.getSummary(userId, walletId, from, to);

    return res.json({ 
      success: true,
      summary 
    });
  } catch (error) {
    console.error("getTransactionSummary error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: "Failed to fetch transaction summary" 
    });
  }
};
