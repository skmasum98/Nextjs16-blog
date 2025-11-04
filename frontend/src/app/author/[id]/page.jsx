"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAuthorProfile } from "@/utils/userApi";
import { fetchPostsByAuthor } from "@/utils/postApi";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";

const AuthorProfilePage = () => {
  const { id: authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authorId) return;

    const loadData = async () => {
      try {
        const [profileData, authorPosts] = await Promise.all([
          fetchAuthorProfile(authorId),
          fetchPostsByAuthor(authorId),
        ]);
        setAuthor(profileData);
        setPosts(authorPosts);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load author data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authorId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (!author) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Author not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ---------- Author Header ---------- */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-lg overflow-hidden mb-12">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 p-10">
          <img
            src={author.profilePicture || "/avatar-placeholder.png"}
            alt={author.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {author.name}
            </h1>
            <p className="text-indigo-100 max-w-lg">
              {author.bio || "This author hasn’t added a bio yet."}
            </p>
            <p className="mt-3 text-sm text-indigo-200">
              Joined on{" "}
              {new Date(author.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        {/* ---------- Stats ---------- */}
        <div className="bg-white/10 backdrop-blur-lg flex justify-around md:justify-evenly py-3 text-sm font-medium rounded-b-3xl">
          <div className="flex items-center gap-2">
            📝 <span>{author.totalPosts || posts.length}</span>
            <span className="text-indigo-100">Posts</span>
          </div>
          <div className="flex items-center gap-2">
            ❤️ <span>{author.totalLikes || 0}</span>
            <span className="text-indigo-100">Likes</span>
          </div>
          <div className="flex items-center gap-2">
            💬 <span>{author.totalComments || 0}</span>
            <span className="text-indigo-100">Comments</span>
          </div>
        </div>
      </section>

      {/* ---------- Author Posts ---------- */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {author.name}&apos;s Articles
        </h2>

        {posts.length === 0 ? (
          <div className="text-center text-gray-500 italic py-10">
            No posts published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuthorProfilePage;
