const express = require('express');
const cors = require("cors");
require("dotenv").config();

const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB();

// 🔥 ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/savings', require('./routes/savings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
