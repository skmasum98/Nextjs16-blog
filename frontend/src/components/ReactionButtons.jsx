// blog-application/frontend/src/components/ReactionButtons.jsx
'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toggleReaction } from '@/utils/postApi';

// Initial state will come from the post object fetched by the Server Component
const ReactionButtons = ({ postId, initialLikes, initialDislikes, userId }) => {
    

      const { userInfo } = useSelector((state) => state.auth);

      // Get the current user ID
    const currentUserId = userInfo?._id; 
    // State to manage the counts and the user's current reaction status
   const [likes, setLikes] = useState(initialLikes.length);
    const [dislikes, setDislikes] = useState(initialDislikes.length);

     // Determine initial user reaction based on Redux state
    const [userReaction, setUserReaction] = useState(() => {
        if (currentUserId && initialLikes.includes(currentUserId)) return 'like';
        if (currentUserId && initialDislikes.includes(currentUserId)) return 'dislike';
        return null;
    });
    
    const [error, setError] = useState(null);

    const handleReaction = async (action) => {
        if (!userInfo) {
            setError('Please log in to like or dislike this post.');
            return;
        }
        
        setError(null);
        
        try {
            // Call the API to toggle the reaction
            const newCounts = await toggleReaction(postId, action);
            
            // Update state based on the result
            setLikes(newCounts.likes);
            setDislikes(newCounts.dislikes);
            
            // Update user's reaction state
            if (userReaction === action) {
                // Reaction removed
                setUserReaction(null);
            } else {
                // New reaction added
                setUserReaction(action);
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
        }
    };

    const likeActive = userReaction === 'like' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    const dislikeActive = userReaction === 'dislike' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

    return (
        <div className="border p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Post Reactions (FR-3.3)</h3>
            
            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            <div className="flex space-x-4 items-center">
                <button
                    onClick={() => handleReaction('like')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${likeActive}`}
                    disabled={!userInfo}
                >
                    {/* Placeholder Icons */}
                    <span>👍</span>
                    <span>Like ({likes})</span>
                </button>

                <button
                    onClick={() => handleReaction('dislike')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${dislikeActive}`}
                    disabled={!userInfo}
                >
                    <span>👎</span>
                    <span>Dislike ({dislikes})</span>
                </button>
            </div>
        </div>
    );
};

export default ReactionButtons;