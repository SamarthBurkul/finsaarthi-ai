const mongoose = require("mongoose");

// Investment Comparison Schema
const investmentComparisonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Input Parameters
  selectedInvestments: [{
    type: String,
    enum: ["Gold Investment", "Fixed Deposits", "Mutual Funds"],
    required: true
  }],
  
  investmentAmount: {
    type: Number,
    required: true,
    min: 5000
  },
  
  timePeriod: {
    type: String,
    enum: ["short", "medium", "long"],
    required: true
  },
  
  riskPreference: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true
  },
  
  investmentGoal: {
    type: String,
    enum: [
      "Capital Protection",
      "Steady Income",
      "Wealth Growth",
      "Inflation Protection",
      "Emergency Fund"
    ],
    required: true
  },
  
  liquidityPreference: {
    type: String,
    enum: ["anytime", "some_time", "long_term"],
    required: true
  },
  
  investmentFrequency: {
    type: String,
    enum: ["lump_sum", "monthly"],
    required: true
  },
  
  considerTax: {
    type: Boolean,
    default: false
  },
  
  // Analysis Results
  results: {
    gold: {
      finalValue: Number,
      profit: Number,
      riskLevel: String,
      suitabilityScore: Number,
      pros: [String],
      cons: [String],
      stability: Number,
      liquidity: Number
    },
    fixedDeposit: {
      finalValue: Number,
      profit: Number,
      riskLevel: String,
      suitabilityScore: Number,
      pros: [String],
      cons: [String],
      stability: Number,
      liquidity: Number
    },
    mutualFunds: {
      finalValue: Number,
      profit: Number,
      riskLevel: String,
      suitabilityScore: Number,
      pros: [String],
      cons: [String],
      stability: Number,
      liquidity: Number
    }
  },
  
  // AI Verdict
  aiVerdict: {
    bestOption: String,
    backupOption: String,
    confidence: Number,
    reasoning: String,
    whyNotChosen: [{
      investment: String,
      reason: String
    }]
  }
  
}, {
  timestamps: true
});

// Create index for faster queries
investmentComparisonSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("InvestmentComparison", investmentComparisonSchema);
