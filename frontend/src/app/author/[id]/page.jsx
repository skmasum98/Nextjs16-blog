// blog-application/frontend/src/app/author/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchPostsByAuthor } from '@/utils/postApi'; // New API call
import PostCard from '@/components/PostCard';
import Link from 'next/link';

const AuthorProfilePage = () => {
    const params = useParams();
    const authorId = params.id;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authorName, setAuthorName] = useState('Author'); // Default/Placeholder

    useEffect(() => {
        if (!authorId) return;

        const loadAuthorData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all published posts by this author
                const data = await fetchPostsByAuthor(authorId);
                setPosts(data);
                
                // Set the author name from the first post (assuming data is not empty)
                if (data.length > 0 && data[0].user?.name) {
                    setAuthorName(data[0].user.name);
                } else {
                    // You might want to fetch the user profile explicitly if the post list is empty
                    // For now, we'll keep the default name
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAuthorData();
    }, [authorId]);

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading Author Profile...</div>;
    if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

    return (
        <div className="py-10 max-w-7xl mx-auto">
            <header className="mb-10 p-6 bg-white rounded-xl shadow-lg border-b-4 border-indigo-500">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                    Posts by: <span className="text-indigo-600">{authorName}</span>
                </h1>
                <p className="text-xl text-gray-600">A passionate writer and developer sharing knowledge on modern web stacks.</p>
            </header>

            <h2 className="text-2xl font-bold mb-6">{posts.length} Published Article{posts.length !== 1 ? 's' : ''}</h2>

            {posts.length === 0 ? (
                <p className="text-center text-gray-600">This author has not published any posts yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} /> 
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuthorProfilePage;