const express = require('express');
const cors = require("cors");
require("dotenv").config();

const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB();
// 🔥 AUTH ROUTES
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
