import axios from "axios";
import { getAuthToken } from "./postApi"; // Re-use the token helper (assuming it's available)

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to create authenticated config
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authorized, token missing");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// FR-2.4: Fetch all users (Admin Only)
export const fetchAllUsers = async () => {
  try {
    const config = getAuthHeaders();
    const { data } = await axios.get(`${API_URL}/users`, config);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// FR-2.4: Update user (Admin action)
export const updateUser = async (userId, updateData) => {
  try {
    const config = getAuthHeaders();
    const { data } = await axios.put(
      `${API_URL}/users/${userId}`,
      updateData,
      config
    );
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// FR-2.4: Delete user (Admin action)
export const deleteUser = async (userId) => {
  try {
    const config = getAuthHeaders();
    await axios.delete(`${API_URL}/users/${userId}`, config);
    return "User deleted successfully";
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Admin: Fetch ALL Posts (including Drafts/Suspended)
export const fetchAllPostsAdmin = async () => {
  try {
    const config = getAuthHeaders();
    // We'll create a new Admin-only route for this in the backend
    const { data } = await axios.get(`${API_URL}/posts/all-admin`, config);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Admin: Delete any Post
export const deletePostAdmin = async (postId) => {
  try {
    const config = getAuthHeaders();
    // Uses the existing DELETE /api/posts/:id route
    await axios.delete(`${API_URL}/posts/admin/${postId}`, config);
    return "Post deleted successfully";
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// FR-4.3: Admin: Delete any Comment
export const deleteCommentAdmin = async (commentId) => {
  try {
    const config = getAuthHeaders();
    // Uses the existing DELETE /api/comments/:id route
    await axios.delete(`${API_URL}/comments/${commentId}`, config);
    return "Comment deleted successfully";
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// FR-4.3: Admin: Suspend/Toggle Comment Status
export const toggleCommentSuspend = async (commentId) => {
  try {
    const config = getAuthHeaders();
    // Uses the existing PUT /api/comments/:id/suspend route
    const { data } = await axios.put(
      `${API_URL}/comments/${commentId}/suspend`,
      {},
      config
    );
    return data.isSuspended; // Returns the new suspension status
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const suspendPostAdmin = async (postId) => {
  try {
    const config = getAuthHeaders();
    // Uses the existing PUT /api/posts/:id/suspend route
    // The empty object {} is the request body, though the backend doesn't use it
    const { data } = await axios.put(
      `${API_URL}/posts/admin/${postId}/suspend`,
      {},
      config
    );
    // We rely on the backend to set post.status to 'Suspended' and return a 200
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
