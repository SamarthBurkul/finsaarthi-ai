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
      index: true
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
      min: 0
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR"
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      trim: true,
      default: "general"
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
      index: true
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, walletId: 1, occurredAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
