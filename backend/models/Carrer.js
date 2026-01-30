const mongoose = require("mongoose");

const careerAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Input Data
    currentJobRole: {
      type: String,
      required: true
    },

    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0
    },

    workLocation: {
      type: String,
      required: true
    },

    keySkills: {
      type: String,
      required: true
    },

    industry: {
      type: String,
      required: true
    },

    educationLevel: {
      type: String,
      required: true
    },

    // AI Analysis Results
    currentSalary: {
      min: Number,
      max: Number,
      average: Number
    },

    growthPrediction: {
      oneYear: Number,
      threeYear: Number,
      fiveYear: Number
    },

    careerAnalysis: {
      stabilityScore: Number,
      growthPotential: String,
      automationRisk: String
    },

    skillAnalysis: {
      highValue: [String],
      mediumValue: [String],
      lowValue: [String]
    },

    financialAdvice: {
      monthlySavings: Number,
      emergencyFund: Number,
      investmentReady: Boolean,
      loanEligibility: Number
    },

    lifeGoals: {
      houseAffordability: Number,
      carBudget: Number,
      travelBudget: Number,
      retirementCorpus: Number
    },

    marketComparison: {
      nationalAverage: Number,
      industryAverage: Number,
      percentile: Number
    },

    careerOpportunities: [{
      role: String,
      salaryIncrease: Number,
      timeline: String
    }],

    sideIncomeIdeas: [{
      idea: String,
      potential: Number,
      effort: String
    }],

    // AI Insights
    aiInsights: {
      careerPath: String,
      skillRecommendations: String,
      salaryNegotiation: String,
      marketTrends: String
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
careerAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("CareerAnalysis", careerAnalysisSchema);
