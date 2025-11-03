"use client";
import { useState, useEffect } from "react";
import { fetchPosts } from "@/utils/postApi";
import PostCard from "@/components/PostCard";
import CategoryList from "@/components/CategoryList";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const POSTS_PER_PAGE = 6;

const HomePageComponent = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [displayPosts, setDisplayPosts] = useState([]); // posts to show in All Blog Posts section
  const [latestPosts, setLatestPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("keyword") || "";

  useEffect(() => {
    const loadAllPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts(""); // Fetch all posts
        setAllPosts(data);
        setFeaturedPosts(data.slice(0, 5));
        setLatestPosts(data.slice(0, 3));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    loadAllPosts();
  }, []);

  useEffect(() => {
    const loadFilteredPosts = async () => {
      setLoading(true);
      try {
        if (searchKeyword) {
          const data = await fetchPosts(searchKeyword);
          setDisplayPosts(data);
        } else {
          setDisplayPosts(allPosts);
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch posts.");
        setDisplayPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFilteredPosts();
  }, [searchKeyword, allPosts]);

  // === PAGINATION LOGIC ===
  const totalPages = Math.ceil(displayPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = displayPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ===== HERO / BANNER ===== */}
      <section className="relative bg-linear-to-r from-indigo-600 to-purple-700 text-white py-20 rounded-3xl shadow-xl mt-8 mx-4">
        <div className="text-center px-6 md:px-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Welcome to{" "}
            <span className="text-yellow-300">SyncWave Blog Site</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            SyncWave – symbolizing synchronization, teamwork, and a wave of
            innovation.
          </p>
          <Link
            href="/create-post"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300"
          >
            Write Your First Post
          </Link>
        </div>
      </section>

      {/* ===== FEATURED POSTS SLIDER ===== */}
      {!searchKeyword && (
        <section className="mt-16 px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            🌟 Featured Posts
          </h2>
          {loading ? (
            <div className="text-center py-12 text-xl font-semibold text-gray-600">
              Loading Featured Posts...
            </div>
          ) : featuredPosts.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {featuredPosts.map((post) => (
                <SwiperSlide key={post._id}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={post.featuredImage || "/placeholder.jpg"}
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.description || "No description available."}
                      </p>
                      <Link
                        // ************************************************
                        // ** CHANGE MADE HERE: Using post.slug for the URL **
                        // ************************************************
                        href={`/posts/${post.slug}`} 
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center text-gray-500">
              No featured posts found.
            </div>
          )}
        </section>
      )}

      {/* ===== CATEGORY SECTION ===== */}
      {!searchKeyword && (
        <section className="mt-16 px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            🗂 Explore Categories
          </h2>
          <CategoryList />
        </section>
      )}

      {/* ===== LATEST POSTS ===== */}
      {!searchKeyword && (
        <section className="mt-16 px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            📰 Latest Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              // NOTE: PostCard component will need to use post.slug internally
              <PostCard key={post._id} post={post} /> 
            ))}
          </div>
        </section>
      )}

      {/* ===== ALL POSTS (OR SEARCH RESULTS) ===== */}
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
                // NOTE: PostCard component will need to use post.slug internally
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
    </div>
  );
};

export default HomePageComponent;