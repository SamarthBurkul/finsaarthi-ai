const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: "Primary Wallet"
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR"
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
