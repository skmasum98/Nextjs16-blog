// blog-application/backend/routes/categoryRoutes.js

// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

// Public GET /api/categories (for post filtering/navigation)
// Admin POST /api/categories (Create)
router.route("/").get(getCategories).post(protect, admin, createCategory);

// Admin PUT/DELETE on /api/categories/:id
router
  .route("/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
