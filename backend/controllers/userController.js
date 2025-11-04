import asyncHandler from "express-async-handler";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateTokenAndSetCookies } from "../middleware/GenerateToken.js";
import cloudinary from "../config/cloudinaryConfig.js";
import getDataUri from "../utils/dataUri.js";


// Helper function to generate a JWT (used for both register and login)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await User.create({
    name,
    email,
    password,
    verificationCode,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  if (user) {
    sendEmail({
      email: user.email,
      subject: "Verify your Blog App account",
      message: `
        <h2>Welcome to the Blog App!</h2>
        <p>Your verification code is:</p>
        <h1>${verificationCode}</h1> 
        <p>This code will expire in 24 hours.</p>
      `,
    }).catch(err => {
      
      console.error("Asynchronous email send failed for user:", user.email, err.message);
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      email: user.email,
      verificationCode,
      isVerified: user.isVerified,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Verify Email Controller
const VerifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({
    email,
    verificationCode: code.toString(),
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification code.",
    });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  generateTokenAndSetCookies(res, user._id);

  res.status(200).json({
    success: true,
    message: "Email verified successfully!",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      }),
    },
  });
});

// Resend verification code
const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ success: false, message: "User is already verified" });
  }

  // Generate new 6-digit verification code
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  user.verificationCode = verificationCode;
  user.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // expires in 15 mins
  await user.save();

  // Debug: make sure email exists
  console.log("Sending verification email to:", user.email);

  // Send verification code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your Blog App account",
      message: `
        <h2>Welcome to the Blog App!</h2>
        <p>Your verification code is:</p>
        <h1>${verificationCode}</h1>
        <p>This code will expire in 24 hours.</p>
      `,
    });
  } catch (err) {
    console.error("Error sending verification email:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email. Check your SMTP config.",
    });
  }

  res.status(200).json({
    success: true,
    message: "A new verification code has been sent to your email.",
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check if email is verified
  if (!user.isVerified) {
    return res.status(401).json({
      success: false,
      message: "Please verify your email before logging in",
    });
  }

  // Check if user exists AND password matches (using the model method)
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error("Invalid email or password");
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  try {
    // Find user by ID from middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update text fields if provided
    const { name, bio, role, website, location, github } = req.body;
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.role = role || user.role;
    user.website = website || user.website;
    user.location = location || user.location;
    user.github = github || user.github;

    // Handle image upload
    if (req.file) {
      const file = getDataUri(req.file);
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(file.content);
        user.profilePicture = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // Save updated user
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        website: updatedUser.website,
        location: updatedUser.location,
        github: updatedUser.github,
        token: generateToken(updatedUser._id), // refresh token
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  console.log("User ID in middleware:", req.user?.id); // debug
  const user = await User.findById(req.user?._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  // Only fetch non-password fields
  const users = await User.find({}).select("-password");

  res.json(users);
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Admin can update name, email, or role
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && user._id.toString() !== req.user._id.toString()) {
    await user.deleteOne();
    res.json({ message: "User removed successfully" });
  } else if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own admin account");
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  // 1. FIND THE USER DOCUMENT BY EMAIL
  const user = await User.findOne({ email: req.body.email }); // <--- RESTORED

  if (!user) {
    // IMPORTANT: Always return a success message for security, even if the user isn't found
    return res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  }

  // 2. TOKEN GENERATION AND SAVING LOGIC (RESTORED FROM PREVIOUS STEP)
  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  // const resetUrl = `https://interactive-cares-mern-full-stack-b-topaz.vercel.app/reset-password/${resetToken}`;
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password. This link is valid for 10 minutes:</p>
        <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
    `;

  // 3. CALL sendEmail USING THE DOCUMENT INSTANCE
  try {
    await sendEmail({
      email: user.email, // <--- CORRECT: Using user.email (document instance)
      subject: "Password Reset Request for Blog Application",
      message: message,
    });

    res.status(200).json({
      message: "Password reset link sent successfully to your email.",
    });
  } catch (error) {
    console.error("Email failed to send:", error);
    // Clear token on failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error(
      "Password reset email failed to send. Please try again later."
    );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  // Hash the URL token to search the database
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired password reset token.");
  }

  // Hash the new password (The pre('save') hook in User.js will handle the hashing!)
  user.password = password;

  // Clear the token fields after a successful reset
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); // Save triggers the password hash

  // Generate JWT token
  const tokenJWT = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.status(200).json({
    success: true,
    message: "Password reset successful! You are now logged in.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: tokenJWT,
    },
  });
});


const getAuthorProfile = asyncHandler(async (req, res) => {
  const authorId = req.params.id;

  // 1️⃣ Fetch basic author info
  const user = await User.findById(authorId).select("name bio profilePicture createdAt");

  if (!user) {
    res.status(404);
    throw new Error("Author not found");
  }

  // 2️⃣ Count total posts and likes
  const posts = await Post.find({ user: authorId });
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalDislikes = posts.reduce((sum, post) => sum + (post.dislikes?.length || 0), 0);

  // 3️⃣ Combine and return
  res.json({
    _id: user._id,
    name: user.name,
    bio: user.bio,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    totalPosts,
    totalLikes,
    totalDislikes,
  });
});

export {
  registerUser,
  VerifyEmail,
  resendVerificationCode,
  authUser,
  getUserProfile,
  updateProfile,
  getUsers,
  updateUserByAdmin,
  deleteUser,
  forgotPassword,
  resetPassword,
  getAuthorProfile
};
