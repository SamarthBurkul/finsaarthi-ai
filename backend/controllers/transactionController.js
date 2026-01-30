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
    console.log('🚀 ===== CREATE TRANSACTION START =====');
    
    const userId = req.userId;
    console.log('👤 Step 1: User ID:', userId);
    
    const { walletId, type, amount, currency, description, category, status, metadata, occurredAt } = req.body || {};
    console.log('📦 Step 2: Request body:', { walletId, type, amount, currency, description, category, status });

    // Validate transaction type
    console.log('✅ Step 3: Validating transaction type...');
    if (!type || !["credit", "debit"].includes(type)) {
      console.log('❌ Step 3 FAILED: Invalid type');
      return res.status(400).json({ 
        success: false,
        error: "Invalid transaction type",
        message: "type must be one of: credit, debit" 
      });
    }
    console.log('✅ Step 3 PASSED: Type is valid:', type);

    // Validate and parse amount
    console.log('✅ Step 4: Parsing amount...');
    const amt = parseAmount(amount);
    if (amt === null) {
      console.log('❌ Step 4 FAILED: Invalid amount');
      return res.status(400).json({ 
        success: false,
        error: "Invalid amount",
        message: "amount must be a positive number greater than 0" 
      });
    }
    console.log('✅ Step 4 PASSED: Amount parsed:', amt);

    // Find user's wallet
    console.log('✅ Step 5: Finding wallet...');
    const wallet = await findWalletForUser(userId, walletId);
    if (!wallet) {
      console.log('❌ Step 5 FAILED: Wallet not found');
      return res.status(404).json({ 
        success: false,
        error: "Wallet not found",
        message: "No wallet found for this user. Please create a wallet first." 
      });
    }
    console.log('✅ Step 5 PASSED: Wallet found:', { _id: wallet._id, balance: wallet.balance, status: wallet.status });

    // Check wallet status
    console.log('✅ Step 6: Checking wallet status...');
    if (wallet.status !== "active") {
      console.log('❌ Step 6 FAILED: Wallet not active');
      return res.status(400).json({ 
        success: false,
        error: "Wallet inactive",
        message: `Cannot perform transaction. Wallet status is ${wallet.status}` 
      });
    }
    console.log('✅ Step 6 PASSED: Wallet is active');

    // For debit transactions, check if sufficient balance exists
    console.log('✅ Step 7: Checking balance for debit...');
    if (type === "debit" && wallet.balance < amt) {
      console.log('❌ Step 7 FAILED: Insufficient balance');
      return res.status(400).json({ 
        success: false,
        error: "Insufficient funds",
        message: `Current balance (${wallet.balance} ${wallet.currency}) is less than transaction amount (${amt} ${currency || wallet.currency})` 
      });
    }
    console.log('✅ Step 7 PASSED: Balance check OK');

    // Generate transaction timestamp
    console.log('✅ Step 8: Generating timestamp...');
    const txOccurredAt = occurredAt ? new Date(occurredAt) : new Date();
    console.log('✅ Step 8 PASSED: Timestamp:', txOccurredAt);
    
    // Validate timestamp is not in future
    console.log('✅ Step 9: Validating timestamp...');
    if (txOccurredAt > new Date()) {
      console.log('❌ Step 9 FAILED: Future timestamp');
      return res.status(400).json({ 
        success: false,
        error: "Invalid timestamp",
        message: "Transaction date cannot be in the future" 
      });
    }
    console.log('✅ Step 9 PASSED: Timestamp is valid');

    // Generate tamper-proof transaction hash BEFORE updating wallet
    console.log('✅ Step 10: Generating transaction hash...');
    let txHash;
    try {
      txHash = generateTxHash({ 
        userId, 
        walletId: String(wallet._id), 
        type, 
        amt, 
        occurredAt: txOccurredAt 
      });
      console.log('✅ Step 10 PASSED: Hash generated:', txHash);
    } catch (hashError) {
      console.error('❌ Step 10 FAILED: Error generating transaction hash:', hashError);
      return res.status(500).json({ 
        success: false,
        error: "Hash generation failed",
        message: "Failed to generate transaction hash" 
      });
    }

    // Update wallet balance atomically
    console.log('✅ Step 11: Updating wallet balance atomically...');
    let updatedWallet;
    if (type === "credit") {
      console.log('💰 Step 11a: Processing CREDIT transaction');
      updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, userId, status: "active" },
        { $inc: { balance: amt } },
        { new: true, runValidators: true }
      );

      if (!updatedWallet) {
        console.log('❌ Step 11a FAILED: Could not update wallet (credit)');
        return res.status(400).json({ 
          success: false,
          error: "Transaction failed",
          message: "Wallet is not active or was modified during transaction" 
        });
      }
      console.log('✅ Step 11a PASSED: Wallet credited. New balance:', updatedWallet.balance);
    } else {
      console.log('💸 Step 11b: Processing DEBIT transaction');
      // Debit with balance check (atomic operation)
      updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, userId, status: "active", balance: { $gte: amt } },
        { $inc: { balance: -amt } },
        { new: true, runValidators: true }
      );

      if (!updatedWallet) {
        console.log('❌ Step 11b FAILED: Could not update wallet (debit)');
        return res.status(400).json({ 
          success: false,
          error: "Insufficient funds",
          message: "Balance was insufficient or wallet was modified during transaction" 
        });
      }
      console.log('✅ Step 11b PASSED: Wallet debited. New balance:', updatedWallet.balance);
    }

    // Create transaction record with hash
    console.log('✅ Step 12: Creating transaction record...');
    try {
      const txData = {
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
      };
      console.log('📝 Step 12a: Transaction data:', txData);
      
      const tx = await Transaction.create(txData);
      console.log('✅ Step 12 PASSED: Transaction created:', { _id: tx._id, txHash: tx.txHash, amount: tx.amount });

      // Log audit trail
      console.log('✅ Step 13: Creating audit log...');
      try {
        const auditLog = generateAuditLog(tx, 'created');
        console.log('📝 Step 13 PASSED: Transaction audit log:', auditLog);
      } catch (auditErr) {
        console.warn('⚠️ Step 13 WARNING: Audit log failed (non-critical):', auditErr.message);
      }

      console.log('🎉 ===== TRANSACTION CREATED SUCCESSFULLY =====');
      return res.status(201).json({ 
        success: true,
        transaction: tx, 
        wallet: updatedWallet,
        message: `Transaction successful. ${type === 'credit' ? 'Added' : 'Deducted'} ${amt} ${tx.currency}`
      });
    } catch (txErr) {
      // CRITICAL: Rollback wallet balance if transaction creation fails
      console.error('❌ Step 12 FAILED: Transaction creation failed, initiating rollback:', txErr);
      
      try {
        const rollbackInc = type === "credit" ? -amt : amt;
        console.log('🔄 Rollback: Reverting balance by', rollbackInc);
        await Wallet.updateOne(
          { _id: wallet._id, userId }, 
          { $inc: { balance: rollbackInc } }
        );
        console.log('✅ Rollback: Balance rollback successful');
      } catch (rollbackErr) {
        console.error('🔴 CRITICAL: Balance rollback failed:', rollbackErr);
        // In production, this should trigger an alert/notification system
      }

      throw txErr;
    }
  } catch (error) {
    console.error("❌ ===== CREATE TRANSACTION FAILED =====");
    console.error("❌ Error:", error.message);
    console.error("❌ Error stack:", error.stack);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: error.message || "An error occurred while creating the transaction",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized",
        message: "User ID not found in request" 
      });
    }

    console.log('📋 Fetching transactions for user:', userId);

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

    console.log('🔍 Query:', query, 'Limit:', parsedLimit, 'Skip:', parsedSkip);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ occurredAt: -1, _id: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .lean(),
      Transaction.countDocuments(query)
    ]);

    console.log('✅ Found', transactions.length, 'transactions');

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
    console.error("❌ getTransactions error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      success: false,
      error: "Server error",
      message: error.message || "Failed to fetch transactions",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
