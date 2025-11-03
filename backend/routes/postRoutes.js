// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const {
//     createPost, getPublishedPosts, getPostBySlug, toggleReaction,
//     suspendPost, deletePost, getAllPostsAdmin, getMyPosts,
//     updatePost, getPostById, deletePostByUser, getPostsByAuthor,
//     getLatestPosts
// } = require('../controllers/postController');
import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createPost,
  getPublishedPosts,
  getPostBySlug,
  toggleReaction,
  suspendPost,
  deletePost,
  getAllPostsAdmin,
  getMyPosts,
  updatePost,
  getPostById,
  deletePostByUser,
  getPostsByAuthor,
  getLatestPosts,
} from "../controllers/postController.js";

// 1. General/List/Create Routes
router.route("/").post(protect, createPost).get(getPublishedPosts);

// 2. SPECIFIC LIST ROUTES (Must be before any general dynamic routes)
router.route("/all-admin").get(protect, admin, getAllPostsAdmin);
router.route("/my-posts").get(protect, getMyPosts);
router.route("/my-posts/:id").delete(protect, deletePostByUser);

// 3. PROTECTED ID ROUTES (By adding a segment like /admin or /author, we fix the conflict)
router.get("/edit/:id", protect, getPostById); // GET /api/posts/edit/:id (Protected for Edit)
router.put("/edit/:id", protect, updatePost); // PUT /api/posts/edit/:id (Update)
router.delete("/admin/:id", protect, admin, deletePost); // DELETE /api/posts/admin/:id (Admin Delete)
router.put("/admin/:id/suspend", protect, admin, suspendPost); // PUT /api/posts/admin/:id/suspend
router.put("/react/:postId", protect, toggleReaction); // PUT /api/posts/react/:postId

// GET /api/posts/author/:id - Public route to list an author's posts
router.route("/author/:id").get(getPostsByAuthor);
router.route("/latest/:excludeId").get(getLatestPosts);

// --- 4. PUBLIC SLUG ROUTE (ABSOLUTELY LAST) ---
router.route("/:slug").get(getPostBySlug); // GET /api/posts/:slug

export default router;
