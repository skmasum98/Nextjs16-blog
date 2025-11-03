// blog-application/frontend/src/app/profile/components/MyPosts.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken, deleteMyPost } from '@/utils/postApi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Function to fetch ONLY the logged-in user's posts
const fetchMyPosts = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authorized');

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`${API_URL}/posts/my-posts`, config);
    return data;
};

// Function for a Regular User to delete their own post
const deleteMyPostAPI = async (postId) => {
     const token = getAuthToken();
     if (!token) throw new Error('Not authorized');
    
     const config = { headers: { Authorization: `Bearer ${token}` } };
     // DELETE /api/posts/my-posts/:id (This is the new route)
     await axios.delete(`${API_URL}/posts/my-posts/${postId}`, config);
     return 'Post deleted successfully';
};


const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchMyPosts();
                setPosts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);
    
    // NOTE: Deleting a post is disabled until the backend is updated with the correct ownership check.

    // --- Delete Handler ---
    const handleDelete = async (postId, postTitle) => {
        if (window.confirm(`Are you sure you want to permanently DELETE your post: "${postTitle}"? This will also delete all comments.`)) {
            try {
                await deleteMyPostAPI(postId); // Call the new API function
                
                // Optimistic UI update
                setPosts(posts.filter(p => p._id !== postId)); 
                // You may want a success message here
                
            } catch (err) {
                setError(err.message.includes('403') ? 'Error: You do not own this post.' : err.message);
            }
        }
    };


    if (loading) return <div className="text-center py-8">Loading your posts...</div>;
    if (error) return <div className="text-red-600 py-8">Error loading posts: {error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Your Published Content ({posts.length} posts)</h2>
            <Link href="/create-post" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                + Create New Post
            </Link>

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                            <tr key={post._id} className={post.status === 'Suspended' ? 'bg-red-50' : post.status === 'Draft' ? 'bg-yellow-50' : ''}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <Link href={`/posts/${post.slug}`} className="hover:underline">{post.title}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        post.status === 'Published' ? 'bg-green-100 text-green-800' : 
                                        post.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link href={`/edit-post/${post._id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(post._id, post.title)} 
                                        // Disabled until secure endpoint is created
                                        className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyPosts;