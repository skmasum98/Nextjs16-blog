import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) return JSON.parse(userInfo).token || null;
  }
  return null;
};

const getAuthConfig = () => {
  const token = getAuthToken();
  return token
    ? {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    : { headers: { "Content-Type": "application/json" } };
};

// ----------------------------
// CREATE POST (Protected)
// ----------------------------
export const createPost = async (postData) => {
  const config = getAuthConfig();
  if (!config.headers.Authorization) {
    throw new Error("User not authenticated. Please log in.");
  }

  const { data } = await axios.post(`${API_URL}/posts`, postData, config);
  return data;
};

// ----------------------------
// FETCH POSTS (Protected route with optional token)
// ----------------------------
export const fetchPosts = async (keyword = "", category = "") => {
  try {
    // Base endpoint for published posts
    let url = `${API_URL}/posts`;

    // Add query params dynamically
    const params = [];
    if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    // Auth header (optional if API allows public access)
    const config = getAuthConfig();

    // Fetch posts
    const { data } = await axios.get(url, config);

    // Return always as an array
    return Array.isArray(data) ? data : data.posts || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch posts from server"
    );
  }
};

// ----------------------------
// FETCH POST BY SLUG (Public)
// ----------------------------
export const fetchPostBySlug = async (slug) => {
  const { data } = await axios.get(`${API_URL}/posts/${slug}`);
  return data;
};

// ----------------------------
// TOGGLE LIKE/DISLIKE (Protected)
// ----------------------------
export const toggleReaction = async (postId, action) => {
  const config = getAuthConfig();
  if (!config.headers.Authorization)
    throw new Error("User not authenticated. Please log in to react.");

  const { data } = await axios.put(
    `${API_URL}/posts/react/${postId}`,
    { action },
    config
  );
  return data;
};

// ----------------------------
// FETCH POST BY ID (Protected)
// ----------------------------
export const fetchPostById = async (postId) => {
  const config = getAuthConfig();
  if (!config.headers.Authorization) throw new Error("User not authenticated.");

  const { data } = await axios.get(`${API_URL}/posts/edit/${postId}`, config);
  return data;
};

// ----------------------------
// UPDATE POST (Protected)
// ----------------------------
export const updatePost = async (postId, postData) => {
  const config = getAuthConfig();
  if (!config.headers.Authorization) throw new Error("User not authenticated.");

  const { data } = await axios.put(
    `${API_URL}/posts/edit/${postId}`,
    postData,
    config
  );
  return data;
};

// ----------------------------
// DELETE POST (Protected)
// ----------------------------
export const deleteMyPostAPI = async (postId) => {
  const config = getAuthConfig();
  if (!config.headers.Authorization) throw new Error("Not authorized");

  await axios.delete(`${API_URL}/posts/my-posts/${postId}`, config);
  return "Post deleted successfully";
};

// ----------------------------
// FETCH POSTS BY AUTHOR (Public)
// ----------------------------
export const fetchPostsByAuthor = async (authorId) => {
  const { data } = await axios.get(`${API_URL}/posts/author/${authorId}`);
  return data;
};

// ----------------------------
// FETCH LATEST POSTS (Public)
// ----------------------------
export const fetchLatestPosts = async (excludeId) => {
  const { data } = await axios.get(`${API_URL}/posts/latest/${excludeId}`);
  return data;
};
