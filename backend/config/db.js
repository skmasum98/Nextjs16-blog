// blog-application/backend/config/db.js

// const mongoose = require('mongoose');
import mongoose from "mongoose";

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MongoDB connection string (MONGO_URI) is not defined in environment variables"
      );
    }
    const dbURI = process.env.MONGO_URI;
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
