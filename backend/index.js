const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// AUTH
app.use("/api/auth", require("./routes/auth"));

// SAVINGS (already added by pull)
app.use("/api/savings", require("./routes/savings"));

// STOCK MENTOR AI
app.use("/api/stock", require("./routes/stock"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
