const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      unique: true,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true,
      default: 'Primary Wallet'
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD'
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'frozen', 'closed'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', WalletSchema);
