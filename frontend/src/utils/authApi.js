import axios from "axios";

// Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = async (email, password) => {
  const config = { headers: { "Content-Type": "application/json" } };
  const { data } = await axios.post(
    `${API_URL}/users/login`,
    { email, password },
    config
  );
  return data;
};

export const register = async (name, email, password) => {
  const config = { headers: { "Content-Type": "application/json" } };
  const { data } = await axios.post(
    `${API_URL}/users/register`,
    { name, email, password },
    config
  );
  return data;
};

// Helper to get JWT token from localStorage
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) return JSON.parse(userInfo).token;
  }
  return null;
};

// Axios config with Authorization header
export const getAuthConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

// @desc Request password reset link (Forgot Password)
export const forgotPassword = async (email) => {
  const config = { headers: { "Content-Type": "application/json" } };
  const { data } = await axios.post(
    `${API_URL}/users/forgot-password`,
    { email },
    config
  );
  return data; // Return success message
};

// @desc Submit new password with token
export const resetPassword = async (token, password) => {
  const config = { headers: { "Content-Type": "application/json" } };
  const { data } = await axios.put(
    `${API_URL}/users/reset-password/${token}`,
    { password },
    config
  );
  return data; // return the full object, not just data.message
};


export const verifyEmailApi = async (email, code) => {
  const config = { headers: { "Content-Type": "application/json" } };
  const { data } = await axios.post(
    `${API_URL}/users/verifyEmail`,
    { email, code },
    config
  );
  return data;
};
