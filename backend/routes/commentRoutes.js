// blog-application/backend/routes/commentRoutes.js

// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const { createComment, getPostComments, suspendComment, deleteComment, getAllCommentsAdmin } = require('../controllers/commentController');
import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createComment,
  getPostComments,
  suspendComment,
  deleteComment,
  getAllCommentsAdmin,
} from "../controllers/commentController.js";

// POST /api/comments - Create a new comment (FR-4.1)
router.route("/").post(protect, createComment);

// 1. NEW Admin List Route (Specific Route - MUST go first to prevent collision)
router.route("/all-admin").get(protect, admin, getAllCommentsAdmin); // GET /api/comments/all-admin

// GET /api/comments/:postId - Fetch all comments for a post (FR-4.1)
router.route("/:postId").get(getPostComments);

// Admin Moderation Routes
router.route("/:id").delete(protect, admin, deleteComment); // DELETE /api/comments/:id (FR-4.3)

router.put("/:id/suspend", protect, admin, suspendComment); // PUT /api/comments/:id/suspend (FR-4.3)

export default router;
