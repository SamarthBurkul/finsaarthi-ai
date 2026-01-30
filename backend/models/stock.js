const mongoose = require("mongoose");

const stockAIReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Context from budget / profile
    monthlyIncome: {
      type: Number,
      required: true
    },

    savingsGoal: {
      type: Number,
      required: true
    },

    riskProfile: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true
    },

    // AI SCORES (as shown in UI)
    scores: {
      riskScore: {
        type: Number, // e.g. 60
        min: 0,
        max: 100
      },
      learningSuitability: {
        type: Number, // e.g. 65
        min: 0,
        max: 100
      },
      marketEmotion: {
        type: Number, // e.g. 55
        min: 0,
        max: 100
      }
    },

    // TEXTUAL AI INSIGHTS
    learningPoints: [String],

    skillsYouWillLearn: [String],

    riskFactorsToLearnAbout: [String],

    commonBeginnerMistakes: [String],

    emotionalRiskAwareness: {
      scenario: String,
      psychologicalImpact: String,
      learningValue: String
    },

    futureOutlook: {
      growthPotential: String,
      industryTrends: String,
      challenges: String,
      educationalValue: String
    },

    aiSummary: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StockAIReport", stockAIReportSchema);


const userBudgetInputSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Time context
    month: {
      type: Number, // 1–12
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    // Core income
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0
    },

    // Expense breakdown
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

    // Savings target
    savingsGoal: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    // Optional notes from user
    userNotes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("UserBudgetInput", userBudgetInputSchema);
