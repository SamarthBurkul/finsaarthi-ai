const mongoose = require('mongoose');

const connectDB = async () => {
<<<<<<< HEAD
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    mongoose.set('strictQuery', true);

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
=======
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
>>>>>>> 83e71685da1a350e93201aa233b2fa10ae7fe1c2
    process.exit(1);
  }
};

module.exports = connectDB;