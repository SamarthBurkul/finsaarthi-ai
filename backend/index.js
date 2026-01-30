<<<<<<< HEAD
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  return res.json({ success: true, status: 'ok' });
});

// Register routes
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
=======
// backend/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://finsaarthi-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB connection
connectDB();

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/savings", require("./routes/savings"));
app.use("/api/investment", require("./routes/investment"));
app.use("/api/career", require("./routes/career"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/budget", require("./routes/budget"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> b3c1955d92a5c127cb5cc3d8a59af6689d34bc23
