const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Amount cannot be negative"]
    },

    category: {
      type: String,
      enum: [
        "Food",
        "Travel",
        "Shopping",
        "Education",
        "Bills",
        "Family",
        "Entertainment",
        "Healthcare",
        "Other"
      ],
      required: true
    },

    purpose: {
      type: String,
      required: true,
      trim: true
      // e.g. "Lunch at XYZ Restaurant"
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Net Banking", "Wallet"],
      default: "UPI"
    },

    expenseDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
