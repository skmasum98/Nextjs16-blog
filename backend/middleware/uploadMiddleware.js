import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinaryConfig.js";

// Multer Storage Configuration (we use memory storage to buffer the file)
const storage = multer.memoryStorage();

// Multer instance for a single file upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Simple file type check (for initial validation)
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
}).single("image"); // 'image' is the expected field name from the frontend form-data

// Custom middleware to handle the upload to Cloudinary (Step 2)
const uploadToCloudinary = asyncHandler(async (req, res, next) => {
  // Multer handles the file and attaches it to req.file
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during upload (e.g., file size limit)
      res.status(400);
      return next(new Error(`Multer Error: ${err.message}`));
    } else if (err) {
      // An unknown error occurred
      res.status(400);
      return next(err);
    }

    // No file provided, continue
    if (!req.file) {
      return next();
    }

    // Convert the buffer to a Data URI for upload
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "blog_app_featured_images", // Optional folder
        resource_type: "image",
        // Add more security/transforms here if needed
      });

      // Attach the final secure URL to the request body
      // We use the secure URL for HTTPS (NFR-4.1.5)
      req.body.featuredImageUrl = result.secure_url;

      next(); // Continue to the final route handler
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      res.status(500);
      return next(new Error("Image upload failed to the cloud service."));
    }
  });
});

export { uploadToCloudinary };
