const mongoose = require("mongoose");

const monthlyBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    month: {
      type: Number, // 1 = Jan, 12 = Dec
      required: true,
      min: 1,
      max: 12
    },

    year: {
      type: Number,
      required: true
    },

    monthlyIncome: {
      type: Number,
      required: [true, "Monthly income is required"],
      min: 0
    },

    expenses: {
      rentHousing: {
        type: Number,
        default: 0,
        min: 0
      },
      foodGroceries: {
        type: Number,
        default: 0,
        min: 0
      },
      emiLoans: {
        type: Number,
        default: 0,
        min: 0
      },
      travelTransport: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    savingsGoal: {
      type: Number,
      required: [true, "Savings goal is required"],
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    aiSuggestion: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MonthlyBudget", monthlyBudgetSchema);
