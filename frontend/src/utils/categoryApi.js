// blog-application/frontend/src/utils/categoryApi.js

import axios from 'axios';
import { getAuthToken } from './postApi'; // Re-use the token helper

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to create authenticated config (Admin access)
const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authorized, token missing');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};


// 1. Get All Categories (Public/Reusable)
export const fetchCategories = async () => {
    // Public route, no headers needed
    const { data } = await axios.get(`${API_URL}/categories`);
    return data;
};

// 2. Admin: Create Category
export const createCategory = async (name) => {
    const config = getAuthHeaders();
    const { data } = await axios.post(`${API_URL}/categories`, { name }, config);
    return data;
};

// 3. Admin: Update Category
export const updateCategory = async (id, name) => {
    const config = getAuthHeaders();
    const { data } = await axios.put(`${API_URL}/categories/${id}`, { name }, config);
    return data;
};

// 4. Admin: Delete Category
export const deleteCategory = async (id) => {
    const config = getAuthHeaders();
    await axios.delete(`${API_URL}/categories/${id}`, config);
    return 'Category deleted';
};