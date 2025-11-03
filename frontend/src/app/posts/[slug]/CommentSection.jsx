// blog-application/frontend/src/app/posts/[slug]/CommentSection.jsx
'use client'; 

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchComments, postComment } from '@/utils/commentApi';
import Link from 'next/link';

const CommentSection = ({ postId }) => {
    const { userInfo } = useSelector(state => state.auth);
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentError, setCommentError] = useState(null);


    // Fetch comments on mount
    useEffect(() => {
        const loadComments = async () => {
            try {
                const data = await fetchComments(postId);
                setComments(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load comments.');
                setLoading(false);
            }
        };

        loadComments();
    }, [postId]);


    // Handle comment submission (FR-4.1)
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        setCommentError(null);

        if (!newComment.trim()) {
            setCommentError('Comment cannot be empty.');
            return;
        }

        if (!userInfo) {
            setCommentError('You must be logged in to comment.');
            return;
        }

        try {
            const addedComment = await postComment(postId, newComment);
            
            // Add the newly created comment to the top of the list
            setComments(prev => [addedComment, ...prev]); 
            setNewComment('');
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setCommentError(errorMessage);
        }
    };


    if (loading) return <p className="text-gray-500">Loading comments...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>
            
            {/* Comment Submission Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
                {commentError && <p className="text-sm text-red-600 mb-2">{commentError}</p>}
                
                {userInfo ? (
                    <form onSubmit={handleSubmitComment}>
                        <h3 className="font-semibold mb-2">Leave a Comment as {userInfo.name}</h3>
                        <textarea 
                            rows="4" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none" 
                            placeholder="Your comment..."
                        ></textarea>
                        <button 
                            type="submit"
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Post Comment
                        </button>
                    </form>
                ) : (
                    <p className="text-center p-4 border rounded-lg bg-yellow-50 text-yellow-800">
                        You must <Link href="/login" className='font-semibold underline'>log in</Link> to comment.
                    </p>
                )}
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-gray-800">{comment.user.name}</p>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;