// blog-application/frontend/src/app/category/[slug]/page.jsx

import { fetchPosts } from '@/utils/postApi';
import PostCard from '@/components/PostCard';

// Component signature now receives params from Next.js
const CategoryPage = async ({ params }) => { 
    // FIX 1: Await the params object to fully resolve it
    const resolvedParams = await params;
    
    // FIX 2: Safely access the slug from the resolved object
    const categorySlug = resolvedParams.slug; 

    // Category Name (now safe to read slug)
    const categoryName = categorySlug.replace(/-/g, ' ');

    let posts = [];
    let error = null;

    try {
        // Fetch posts server-side
        const data = await fetchPosts('', categorySlug); // Pass slug as the category filter
        posts = data;
    } catch (err) {
        error = err.message;
    }

    if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

    return (
        <div className="py-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Posts in: <span className="capitalize text-indigo-600">{categoryName}</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>

            {posts.length === 0 ? (
                <p className="text-center text-gray-600">No posts found in this category.</p>
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

export default CategoryPage;