const mongoose = require("mongoose");

/* ========= STOCK AI REPORT ========= */
const stockAIReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    monthlyIncome: {
      type: Number,
      required: true,
    },

    savingsGoal: {
      type: Number,
      required: true,
    },

    riskProfile: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true,
    },

    scores: {
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      learningSuitability: {
        type: Number,
        min: 0,
        max: 100,
      },
      marketEmotion: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    learningPoints: [String],
    skillsYouWillLearn: [String],
    riskFactorsToLearnAbout: [String],
    commonBeginnerMistakes: [String],

    emotionalRiskAwareness: {
      scenario: String,
      psychologicalImpact: String,
      learningValue: String,
    },

    futureOutlook: {
      growthPotential: String,
      industryTrends: String,
      challenges: String,
      educationalValue: String,
    },

    aiSummary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/* ========= USER BUDGET INPUT ========= */
const userBudgetInputSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: Number, // 1–12
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },

    expenses: {
      rentHousing: {
        type: Number,
        default: 0,
        min: 0,
      },
      foodGroceries: {
        type: Number,
        default: 0,
        min: 0,
      },
      emiLoans: {
        type: Number,
        default: 0,
        min: 0,
      },
      travelTransport: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    savingsGoal: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    userNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StockAIReport = mongoose.model("StockAIReport", stockAIReportSchema);
const UserBudgetInput = mongoose.model("UserBudgetInput", userBudgetInputSchema);

module.exports = { StockAIReport, UserBudgetInput };
