// backend/models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  reasons: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['new', 'reviewed', 'dismissed', 'confirmed'],
    default: 'new',
  },
  reviewedAt: {
    type: Date,
  },
  reviewNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', alertSchema);
