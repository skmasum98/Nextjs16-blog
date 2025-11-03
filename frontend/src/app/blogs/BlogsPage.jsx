"use client";
import { useState, useEffect } from "react";
import { fetchPosts } from "@/utils/postApi";
import PostCard from "@/components/PostCard";
import { useSearchParams } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const POSTS_PER_PAGE = 6;

const BlogsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("keyword") || "";

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const data = await fetchPosts(searchKeyword);
        setPosts(data);
        setError(null);
      } catch (err) {
        setPosts([]);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch posts."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [searchKeyword]);

  // === PAGINATION LOGIC ===
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section className="mt-16 px-4 pb-20">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {searchKeyword
          ? `Search Results for "${searchKeyword}"`
          : "All Blog Posts"}
      </h2>

      {loading && (
        <div className="text-center py-12 text-xl font-semibold text-gray-600">
          Loading Posts...
        </div>
      )}
      {!loading && error && (
        <div className="text-center py-12 text-red-500">{error}</div>
      )}

      {!loading && !error && paginatedPosts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* === PAGINATION BUTTONS === */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md font-semibold ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              Previous
            </button>

            <span className="text-lg font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md font-semibold ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default BlogsPage;
