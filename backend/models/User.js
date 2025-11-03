// blog-application/backend/models/User.js

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // FR-1.1: Email must be unique
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Regular User"], // NFR-4.1.1: Role-based access control
      default: "Regular User",
    },
    bio: {
      type: String,
      default: "A proud member of the Blog App community.",
      maxlength: 500,
    },
    profilePicture: {
      type: String, // Will store the URL from Cloudinary or a default
      default: "/default-avatar.png",
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    github: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationTokenExpiresAt: Date,
    // We will add the 'isVerified' field later for email verification (FR-1.2)
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Automatic createdAt and updatedAt fields
  }
);

// --- Middleware: Encrypt password before saving (NFR-4.1.3) ---
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) {
    next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Method to compare passwords for login ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
