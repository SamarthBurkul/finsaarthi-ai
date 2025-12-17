const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* =========================
   CALCULATOR SUB-SCHEMA
========================= */
const calculatorSchema = new mongoose.Schema({
  // EMI
  emi: {
    loanAmount: { type: Number, default: 0 },
    interestRate: { type: Number, default: 0 },
    tenure: { type: Number, default: 0 },
    monthlyEMI: { type: Number, default: 0 },
    totalInterest: { type: Number, default: 0 }
  },

  // SIP
  sip: {
    monthlyAmount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    years: { type: Number, default: 0 },
    maturityAmount: { type: Number, default: 0 }
  },

  // FD
  fd: {
    principal: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    years: { type: Number, default: 0 },
    maturityAmount: { type: Number, default: 0 }
  },

  // RD
  rd: {
    monthlyAmount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    years: { type: Number, default: 0 },
    maturityAmount: { type: Number, default: 0 }
  },

  // Interest Calculator
  interest: {
    principal: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    interestType: {
      type: String,
      enum: ["simple", "compound"],
      default: "compound"
    },
    totalInterest: { type: Number, default: 0 }
  },

  // Savings Growth
  savings: {
    monthlyAmount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    years: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 }
  }
});

/* =========================
   USER SCHEMA
========================= */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    // 🔐 Mongo password (for email/password login)
    password: {
      type: String,
      minlength: 6,
      select: false,
      required: function() {
        return this.authProvider === 'mongo';
      }
    },

    // 🔥 Firebase UID (only for Firebase users)
    firebaseUid: {
      type: String,
      default: null
    },

    // 🔁 Track auth type
    authProvider: {
      type: String,
      enum: ["mongo", "firebase"],
      default: "mongo"
    },

    calculators: {
      type: calculatorSchema,
      default: () => ({})
    }
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  // Only hash password if it exists and is modified
  if (!this.password || !this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

/* =========================
   EXPORT MODEL
========================= */
module.exports = mongoose.model("User", userSchema);
