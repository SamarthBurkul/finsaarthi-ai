<<<<<<< HEAD
require("dotenv").config();

const express = require("express");
const cors = require("cors");
=======
// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ============================================
// 1. MIDDLEWARE CONFIGURATION (CORS, PARSERS)
// ============================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://finsaarthi-frontend.vercel.app",
  "https://finsaarthiai-fbgiir2m-samarth-burkuls-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser clients (curl, Postman, server)
    if (process.env.NODE_ENV !== "production"
      && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1 || (origin && origin.includes('vercel.app'))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} is not allowed`), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Universal, minimal preflight responder (placed BEFORE routes)
// This avoids fragile app.options('*', ...) patterns that can trigger path-to-regexp errors.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Mirror origin or allow-all for non-browser; safe for preflight responses
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
    return res.sendStatus(204);
  }
  next();
});

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ============================================
// 2. API ROUTES
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'FinSaarthi API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FinSaarthi API',
    version: '1.0.0',
    docs: { health: '/api/health', auth: '/api/auth' }
  });
});

// mount routes (auth and features)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/investment', require('./routes/investment'));
app.use('/api/career', require('./routes/career'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/transactions', require('./routes/transactions'));

// ============================================
// 3. ERROR HANDLING (must be after routes)
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// 4. START SERVER
// ============================================
const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 FinSaarthi API Server Started`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 JWT Auth: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Missing ⚠️'}`);
      console.log('='.repeat(50));
      if (!process.env.JWT_SECRET) {
        console.warn('⚠️  WARNING: JWT_SECRET is not set. Authentication will not work!');
      }
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  });
>>>>>>> 83e71685da1a350e93201aa233b2fa10ae7fe1c2

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

<<<<<<< HEAD
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
=======
module.exports = app;
>>>>>>> 83e71685da1a350e93201aa233b2fa10ae7fe1c2
