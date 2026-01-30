<<<<<<< HEAD
const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    const err = new Error('Missing MONGO_URI in environment');
    err.statusCode = 500;
    throw err;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}
=======
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
>>>>>>> b3c1955d92a5c127cb5cc3d8a59af6689d34bc23

module.exports = connectDB;
