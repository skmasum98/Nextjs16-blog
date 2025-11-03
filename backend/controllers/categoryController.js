// blog-application/backend/controllers/categoryController.js

// const asyncHandler = require('express-async-handler');
// const Category = require('../models/Category');
// const Post = require('../models/Post');
import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Post from "../models/Post.js";

// @desc    Admin: Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required.");
  }

  const category = await Category.create({ name });
  res.status(201).json(category);
});

// @desc    Get all categories (Public)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  // Return all categories, sorted by name
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

// @desc    Admin: Update a category name
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("New category name is required.");
  }

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name; // Slug is updated by the pre('save') middleware
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Admin: Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // --- REFERENTIAL INTEGRITY CHECK ---
  const dependentPosts = await Post.find({ category: category.name });
  if (dependentPosts.length > 0) {
    res.status(400); // Bad Request
    throw new Error(
      `Cannot delete category "${category.name}". It is currently used by ${dependentPosts.length} post(s). Please reassign or delete those posts first.`
    );
  }

  await category.deleteOne();
  res.json({ message: "Category removed" });
});

export { createCategory, getCategories, updateCategory, deleteCategory };
