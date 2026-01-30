const mongoose = require('mongoose');

const connectDB = async () => {
  // We use MONGODB_URI to match your .env file
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Missing MONGODB_URI in environment variables');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;