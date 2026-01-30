const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    reasons: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["new", "acknowledged", "resolved"],
      default: "new",
    },

    userResponse: {
      type: String,
      enum: ["confirmed_legitimate", "confirmed_fraud", null],
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    resolvedAt: Date,
  }
);

module.exports = mongoose.model("Alert", alertSchema);
