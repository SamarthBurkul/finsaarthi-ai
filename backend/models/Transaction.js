const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true // Prevent modification after creation
    },
    type: {
      type: String,
      required: true,
      enum: ["credit", "debit"],
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"]
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
      maxlength: 3
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500
    },
    category: {
      type: String,
      trim: true,
      default: "general",
      lowercase: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
      index: true
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Audit fields
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    },
    // Track if transaction was part of a reversal
    reversalOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    },
    isReversed: {
      type: Boolean,
      default: false
    },
    reversedAt: {
      type: Date
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    }
  },
  { 
    timestamps: true,
    // Prevent version key from being returned in API responses
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for efficient querying
transactionSchema.index({ userId: 1, walletId: 1, occurredAt: -1 });
transactionSchema.index({ userId: 1, status: 1, occurredAt: -1 });
transactionSchema.index({ userId: 1, type: 1, occurredAt: -1 });
transactionSchema.index({ walletId: 1, occurredAt: -1 });

// Pre-save validation
transactionSchema.pre('save', function(next) {
  // Ensure txHash is present and cannot be changed
  if (!this.txHash) {
    return next(new Error('Transaction hash is required'));
  }
  
  // Ensure occurredAt is not in the future
  if (this.occurredAt > new Date()) {
    return next(new Error('Transaction date cannot be in the future'));
  }
  
  next();
});

// Instance method to verify transaction integrity
transactionSchema.methods.verify = function() {
  const { verifyTxHash } = require('../helpers/generateTxHash');
  return verifyTxHash(this);
};

// Instance method to mark as verified
transactionSchema.methods.markVerified = async function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  return this.save();
};

// Static method to find unverified transactions
transactionSchema.statics.findUnverified = function(userId) {
  return this.find({ userId, isVerified: false }).sort({ occurredAt: -1 });
};

// Static method to get transaction summary
transactionSchema.statics.getSummary = async function(userId, walletId, startDate, endDate) {
  const match = { userId };
  if (walletId) match.walletId = walletId;
  if (startDate || endDate) {
    match.occurredAt = {};
    if (startDate) match.occurredAt.$gte = new Date(startDate);
    if (endDate) match.occurredAt.$lte = new Date(endDate);
  }

  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    totalCredit: 0,
    totalDebit: 0,
    creditCount: 0,
    debitCount: 0
  };

  summary.forEach(item => {
    if (item._id === 'credit') {
      result.totalCredit = item.total;
      result.creditCount = item.count;
    } else if (item._id === 'debit') {
      result.totalDebit = item.total;
      result.debitCount = item.count;
    }
  });

  result.netAmount = result.totalCredit - result.totalDebit;
  result.totalTransactions = result.creditCount + result.debitCount;

  return result;
};

module.exports = mongoose.model("Transaction", transactionSchema);
