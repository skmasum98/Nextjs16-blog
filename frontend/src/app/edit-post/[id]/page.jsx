// blog-application/frontend/src/app/edit-post/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPostById, updatePost } from '@/utils/postApi';
import { useSelector } from 'react-redux';
import { fetchCategories } from '@/utils/categoryApi'; 
import ImageUploader from '@/components/ImageUploader';
import TextEditor from '@/components/TextEditor';

const EditPostPage = () => {
    const params = useParams();
    const postId = params.id;
    const { userInfo } = useSelector((state) => state.auth);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [post, setPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '', content: '', category: '', tags: '', featuredImage: '', status: '', 
        metaTitle: '', metaDescription: ''
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Check for lock status (reads from the original post state)
    const isSuspended = post?.status === 'Suspended'; 

     // To avoid hydration mismatch
        useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Fetch Post Data and Categories on load
    useEffect(() => {
        if (!userInfo || !postId) return;

        const loadData = async () => {
            try {
                // Fetch Post
                const postData = await fetchPostById(postId);
                setPost(postData); // Store original post
                
                // Initialize Form Data
                setFormData({
                    title: postData.title,
                    content: postData.content,
                    category: postData.category,
                    tags: postData.tags.join(', '), 
                    featuredImage: postData.featuredImage,
                    status: postData.status,
                    metaTitle: postData.metaTitle || '',
                    metaDescription: postData.metaDescription || '',
                });
                
                // Fetch Categories
                const categoryData = await fetchCategories();
                setCategories(categoryData);

            } catch (err) {
                setError(err.message);
                if (err.message.includes('403') || err.message.includes('404')) {
                     router.push('/profile');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userInfo, postId, router]);


    // Handlers
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler for ImageUploader to update featuredImage in formData
    const handleFeaturedImageUrl = (url) => {
        setFormData(prev => ({ ...prev, featuredImage: url })); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        setSaving(true);
        try {
            // Prepare data: convert tags string to array
            const postData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            };

            await updatePost(postId, postData);
            
            setSuccess(`Post "${postData.title}" successfully updated!`);
            setSaving(false);

            setTimeout(() => {
                router.push('/profile');
            }, 1500);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            setSaving(false);
        }
    };

    if (!mounted) return null;

    if (!userInfo) return <div className="text-center py-20">Redirecting to Login...</div>;
    if (loading) return <div className="text-center py-20">Loading Post for Editing...</div>;
    if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Post: {post?.title}</h1>
            
            {success && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            {isSuspended && ( // <-- UI Warning for Suspended Post
                 <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg font-bold">
                     ⚠️ This post is currently SUSPENDED by an Admin. Status change is LOCKED.
                 </div>
             )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
                {/* TITLE FIELD */}
                <div>
                    <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full border-gray-300 rounded-lg shadow-sm" placeholder="A catchy title for your blog post"/>
                </div>
                
                {/* CONTENT FIELD */}
                <div>
                    <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-1">Content</label>
                    <TextEditor
                        content={post.content} 
                        onChange={(content) => handleChange({ target: { name: 'content', value: content } })}
                        placeholder="Start writing your amazing content here..."
                    />
                </div>

                {/* IMAGE UPLOADER */}
                <div>
                    <label htmlFor="featuredImage" className="block text-lg font-medium text-gray-700 mb-1">Featured Image URL</label>
                    <ImageUploader 
                        initialUrl={formData.featuredImage} // <-- Reads from formData
                        onUrlChange={handleFeaturedImageUrl}
                    />
                     {/* Hidden URL Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Final Image URL (Hidden State)</label>
                        <input type="text" value={formData.featuredImage} readOnly disabled className="w-full border rounded text-sm bg-gray-100"/>
                    </div>
                </div>

                {/* CATEGORY/STATUS FIELDS */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-lg font-medium text-gray-700 mb-1">Category</label>
                        {/* FIX: Value is correctly bound to formData */}
                        <select name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full border-gray-300 rounded-lg shadow-sm">
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}> 
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-lg font-medium text-gray-700 mb-1">Status</label>
                        {/* CRITICAL FIX: Disable Status if Suspended */}
                        <select 
                            name="status" 
                            id="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            disabled={isSuspended} // <-- UI LOCK IMPLEMENTATION
                            className={`w-full border-gray-300 rounded-lg shadow-sm ${isSuspended ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                </div>

                {/* TAGS FIELD */}
                <div>
                    <label htmlFor="tags" className="block text-lg font-medium text-gray-700 mb-1">Tags (Comma-Separated)</label>
                    <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm" placeholder="e.g., react, tailwind, frontend"/>
                </div>

                {/* SEO FIELDS */}
                <fieldset className="border p-4 rounded-lg space-y-4">
                    <legend className="text-lg font-semibold text-gray-800">SEO Settings (Optional)</legend>
                    <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                        <input type="text" name="metaTitle" id="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm text-sm" placeholder="Custom title for search engines"/>
                    </div>
                    <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                        <textarea name="metaDescription" id="metaDescription" rows="2" value={formData.metaDescription} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm text-sm" placeholder="Custom description for search engines"/>
                    </div>
                </fieldset>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 px-6 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditPostPage;