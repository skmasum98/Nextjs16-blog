// blog-application/backend/models/Comment.js

// const mongoose = require('mongoose');
import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    post: {
      // Links the comment to the parent Post
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    user: {
      // Links the comment to the author
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    isSuspended: {
      // For Admin moderation (FR-4.3)
      type: Boolean,
      default: false,
    },
    // We do NOT include a 'parentComment' field, as nested comments are NOT required (FR-4.4)
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
