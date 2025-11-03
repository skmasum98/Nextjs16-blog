// blog-application/frontend/src/utils/commentApi.js

import axios from 'axios';
import { getAuthToken } from './postApi'; // Re-use the token helper

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Function to fetch all comments for a post (FR-4.1)
export const fetchComments = async (postId) => {
    const { data } = await axios.get(`${API_URL}/comments/${postId}`); 
    return data;
};

// Function to create a new comment (FR-4.1)
export const postComment = async (postId, content) => {
    const token = getAuthToken();

    if (!token) {
        throw new Error('User not authenticated. Please log in to comment.');
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
        },
    };

    const { data } = await axios.post(
        `${API_URL}/comments`, 
        { postId, content },
        config
    );

    return data;
};