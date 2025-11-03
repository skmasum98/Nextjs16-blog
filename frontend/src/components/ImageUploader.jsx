// blog-application/frontend/src/components/ImageUploader.jsx
"use client";

import { useState } from "react";
import { uploadImage } from "@/utils/uploadApi";
import { uploadProfilePicture } from "@/utils/uploadApi"; // <-- Import the upload utility

/**
 * Reusable component for uploading a single featured image.
 * @param {string} initialUrl - URL to display on load (for edit mode).
 * @param {function} onUrlChange - Callback function to update the parent form's state.
 */
const ImageUploader = ({ initialUrl, onUrlChange, inputName = "image" }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await uploadImage(file); // Call the backend-protected upload API

      setLoading(false);
      setError(null);

      // Pass the secure URL back to the parent component (CreatePostPage)
      onUrlChange(url);
    } catch (err) {
      console.error("Upload Error:", err);
      setError(`Upload Failed: ${err.toString()}`);
      setLoading(false);
      // On failure, clear the URL to prevent submitting a bad link
      onUrlChange("");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <label className="block text-sm font-medium text-gray-700">
        Featured Image Upload
      </label>

      {/* Display Error/Loading */}
      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
      {loading && (
        <p className="text-sm text-blue-600 font-semibold animate-pulse">
          Uploading to Cloudinary...
        </p>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="w-48 h-32 overflow-hidden rounded-md border shadow-sm">
          {/* NOTE: Use the local object URL for instant preview, or the Cloudinary URL */}
          <img
            src={previewUrl}
            alt="Image Preview"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex space-x-3">
        <input
          type="file"
          name={inputName || "image"}
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          className="grow text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
            loading || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Hidden Input to hold the final URL for the main form's state */}
      {/* This URL will be passed back via onUrlChange, but we keep the logic here */}
    </div>
  );
};

export default ImageUploader;
