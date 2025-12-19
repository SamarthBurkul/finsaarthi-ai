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
