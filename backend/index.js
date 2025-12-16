const express = require('express');
const cors = require("cors");
require("dotenv").config();

const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB();


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
