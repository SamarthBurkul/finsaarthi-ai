require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. CORS Configuration
// NOTE: Your frontend dev server can run on different ports (e.g. 5173/5174).
// This allows any localhost origin in non-production, while keeping an allowlist for production.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://finsaarthi-frontend.vercel.app",
  "https://finsaarthiai-fbgiir2m-samarth-burkuls-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser clients
      if (!origin) return callback(null, true);

      // In dev, allow any localhost port (prevents frequent CORS breaks when Vite chooses 5174, 5175, etc.)
      if (process.env.NODE_ENV !== "production") {
        if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
          return callback(null, true);
        }
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy blocked this origin"), false);
      }

      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
    optionsSuccessStatus: 204
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// 2. Combined Routes (Teammate + Yours)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/savings", require("./routes/savings"));
app.use("/api/investment", require("./routes/investment"));
app.use("/api/career", require("./routes/career"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/budget", require("./routes/budget"));

// New Wallet & Transaction Routes from Teammate
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/transactions', require('./routes/transactions'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', message: "Backend is running" });
});

// 3. Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

// 4. Database Connection and Server Start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running and listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

  // Add this in backend/index.js
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: "Welcome to FinSaarthi API",
    documentation: "Use /api/health to check status" 
  });
}); 