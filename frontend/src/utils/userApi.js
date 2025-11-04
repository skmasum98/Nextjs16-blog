import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAuthorProfile = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/users/author/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch author profile");
  }
};


