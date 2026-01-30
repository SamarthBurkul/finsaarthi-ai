// backend/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      select: false // Don't include password in queries by default
    },
    firebaseUid: {
      type: String,
      sparse: true, // Allow null, but must be unique if present
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// Pre-save hook to update lastLogin
userSchema.pre('save', async function () {
  if (this.isNew) {
    this.lastLogin = new Date();
  }
});

// Instance method to update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
