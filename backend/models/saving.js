const mongoose = require("mongoose");

// SavingsState Schema - Main savings tracking
const savingsStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  dailyGoal: {
    type: Number,
    required: true,
    default: 20,
    min: 1
  },
  currentSavings: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  daysSaved: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSavedDate: {
    type: Date,
    default: null
  },
  selectedGoal: {
    type: String,
    default: ""
  },
  goalPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: "INR"
  }
}, {
  timestamps: true
});

// DailySavingLog Schema - Daily savings history
const dailySavingLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amountSaved: {
    type: Number,
    required: true,
    min: 0
  },
  streakAtSave: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for faster queries
dailySavingLogSchema.index({ userId: 1, date: -1 });

// LifeGoal Schema - Long-term savings goals
const lifeGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  goalName: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentSavedAmount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  }
}, {
  timestamps: true
});

// Create models
const SavingsState = mongoose.model("SavingsState", savingsStateSchema);
const DailySavingLog = mongoose.model("DailySavingLog", dailySavingLogSchema);
const LifeGoal = mongoose.model("LifeGoal", lifeGoalSchema);

// Export models
module.exports = {
  SavingsState,
  DailySavingLog,
  LifeGoal
};
