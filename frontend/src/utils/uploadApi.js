// // blog-application/frontend/src/utils/uploadApi.js

// import axios from "axios";
// import { getAuthToken } from "./postApi"; // Re-use the token helper

// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// // Helper to create authenticated config for multipart/form-data
// const getAuthHeaders = () => {
//   const token = getAuthToken();
//   if (!token) throw new Error("Not authorized, token missing");
//   return {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       // NOTE: We do NOT set Content-Type here; Axios/Browser sets it automatically
//       // for 'multipart/form-data' with the correct boundary.
//     },
//   };
// };

// /**
//  * Uploads a file to the backend's Cloudinary endpoint.
//  * @param {File} file The image file object.
//  * @returns {string} The secure URL of the uploaded image.
//  */
// export const uploadImage = async (file) => {
//   const formData = new FormData();
//   // 'image' must match the Multer field name in the backend: .single('image')
//   formData.append("image", file);

//   try {
//     const config = getAuthHeaders();
//     const { data } = await axios.post(`${API_URL}/upload`, formData, config);

//     return data.url; // Return the final secure URL
//   } catch (error) {
//     throw error.response?.data?.message || error.message;
//   }
// };

import axios from "axios";
import { getAuthToken } from "./postApi"; // Re-use the token helper

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to create authenticated config for multipart/form-data
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authorized, token missing");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      // Axios sets Content-Type automatically for multipart/form-data
    },
  };
};

/**
 * Uploads a file for regular posts (existing CreatePostPage usage)
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const config = getAuthHeaders();
    const { data } = await axios.post(`${API_URL}/upload`, formData, config);
    return data.url; // Default for posts
  } catch (error) {
    console.error("Post Image Upload Error:", error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Uploads a profile picture specifically
 */
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const config = getAuthHeaders();
    const { data } = await axios.post(
      `${API_URL}/users/upload-profile-picture`,
      formData,
      config
    );
    return data.profilePicture; // Return profilePicture URL from backend
  } catch (error) {
    console.error("Profile Picture Upload Error:", error.response || error);
    throw error.response?.data?.message || error.message;
  }
};
