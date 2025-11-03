// blog-application/backend/server.js

// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const cors = require('cors');
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// Import User Routes
// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const commentRoutes = require('./routes/commentRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');
// // Import Error Handling Middleware (will create in the next step)
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
// Import Error Handling Middleware (will create in the next step)
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
// 1. CORS for allowing requests from the frontend
app.use(cors());

// 2. Body parser for JSON data
app.use(express.json());

// Basic Route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- ROUTE HANDLERS GO HERE LATER (e.g., app.use('/api/users', userRoutes)) ---
// --- ROUTE HANDLERS ---
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);

// --- ERROR HANDLERS (MUST be last middleware) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(
  PORT,
  console.log(`Server running in development mode on port ${PORT}`)
);
