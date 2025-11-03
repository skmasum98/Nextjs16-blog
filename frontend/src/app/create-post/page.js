// blog-application/frontend/src/app/create-post/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/utils/postApi";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCategories } from "@/utils/categoryApi";
import ImageUploader from "@/components/ImageUploader";
import TextEditor from "@/components/TextEditor";

const CreatePostPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "Technology", // Default category
    tags: "", // Comma-separated string for now
    featuredImage: "",
    status: "Draft", // Default status is Draft (FR-3.4)
    metaTitle: "",
    metaDescription: "",
  });
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // To avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Protection: Redirect non-logged-in users
  useEffect(() => {
    if (!userInfo) {
      // Optional: Show a message before redirecting
      router.push("/login?redirect=/create-post");
    }
  }, [userInfo, router]);

  // NEW: Fetch categories on mount
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleFeaturedImageUrl = (url) => {
    setPost((prev) => ({ ...prev, featuredImage: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!post.title || !post.content || !post.category || !post.featuredImage) {
      setError("Title, Content, Category, and Featured Image are required.");
      return;
    }

    setLoading(true);
    try {
      // Prepare data: convert tags string to array
      const postData = {
        ...post,
        tags: post.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      const createdPost = await createPost(postData);

      setSuccess(
        `Post "${createdPost.title}" successfully created! Redirecting...`
      );
      setLoading(false);

      // Redirect to the new post's view page (or author dashboard) after 2 seconds
      // Note: We don't have the single post view page yet, so let's redirect to the dashboard
      setTimeout(() => {
        router.push("/profile"); // Placeholder for User Dashboard (FR-2.2)
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!userInfo) {
    // Render nothing or a loading state while redirecting
    return <div className="py-10">Redirecting to Login...</div>;
  }

  // Main Form UI
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Create New Blog Post
      </h1>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-xl shadow-lg"
      >
        {/* Post Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={post.title}
            onChange={handleChange}
            required
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="A catchy title for your blog post"
          />
        </div>

        {/* Content (Rich Text Editor Placeholder) */}
        <div>
          <label
            htmlFor="content"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Content (Rich Text Editor Placeholder)
          </label>
          <TextEditor
            content={post.content}
            onChange={(content) =>
              handleChange({ target: { name: "content", value: content } })
            }
            placeholder="Start writing your amazing content here..."
          />
        </div>

        {/* Featured Image URL (Placeholder for Media Upload) */}
        <div>
          <label
            htmlFor="featuredImage"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Featured Image URL
          </label>
          <ImageUploader
            initialUrl={post.featuredImage}
            onUrlChange={handleFeaturedImageUrl}
          />
          {/* 
                        NOTE: We temporarily keep a disabled text input to show the user the final URL 
                        and confirm it's being saved to the post state.
                    */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Final Image URL (Hidden State)
            </label>
            <input
              type="text"
              value={post.featuredImage}
              readOnly
              disabled
              className="w-full border rounded text-sm bg-gray-100"
            />
          </div>
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="category"
              className="block text-lg font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              name="category"
              id="category"
              value={post.category}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-lg shadow-sm"
            >
              {/* Map the dynamically loaded categories */}
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-lg font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              value={post.status}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        {/* Tags (Comma Separated) */}
        <div>
          <label
            htmlFor="tags"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Tags (Comma-Separated)
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            value={post.tags}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., react, tailwind, frontend"
          />
        </div>

        {/* SEO Fields */}
        <fieldset className="border p-4 rounded-lg space-y-4">
          <legend className="text-lg font-semibold text-gray-800">
            SEO Settings (Optional)
          </legend>
          <div>
            <label
              htmlFor="metaTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Meta Title (FR-6.4)
            </label>
            <input
              type="text"
              name="metaTitle"
              id="metaTitle"
              value={post.metaTitle}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Custom title for search engines (max ~60 characters)"
            />
          </div>
          <div>
            <label
              htmlFor="metaDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Meta Description (FR-6.4)
            </label>
            <textarea
              name="metaDescription"
              id="metaDescription"
              rows="2"
              value={post.metaDescription}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Custom description for search engines (max ~155 characters)"
            />
          </div>
        </fieldset>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 border border-transparent rounded-lg shadow-md text-lg font-medium text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
        >
          {loading ? "Saving Post..." : "Save & Publish/Draft"}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;
