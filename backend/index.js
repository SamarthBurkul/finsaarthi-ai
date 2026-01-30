require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. Your Secure CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://finsaarthi-frontend.vercel.app",
  "https://finsaarthiai-fbgiir2m-samarth-burkuls-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy blocked this origin"), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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