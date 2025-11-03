"use client";
import Link from "next/link";
import { formatDate } from "@/utils/helpers";

const PostCard = ({ post }) => {
  // Calculate reading time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/g).length || 0;
    return `${Math.ceil(wordCount / wordsPerMinute)} min read`;
  };

  return (
    <article className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
      {/* Featured Image */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden">
        <img
          src={post.featuredImage || "/placeholder.jpg"}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => (e.target.src = "/placeholder.jpg")}
        />
        {/* Optional category badge overlay */}
        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {post.category || "Uncategorized"}
        </div>
      </div>

      {/* Post Content */}
      <div className="flex flex-col flex-grow p-5">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 text-xs font-medium text-gray-500">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/posts/${post.slug}`} className="block mb-3 group">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Short Description (Optional) */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Footer - Author Info */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={post.user?.profilePicture || "/default-avatar.png"}
                alt="Author"
                className="h-full w-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>
            <span className="font-medium text-gray-700">
              {post.user?.name || "Deleted Author"}
            </span>
          </div>
          <div className="text-right">
            <p>{formatDate(post.createdAt)}</p>
            <p className="text-gray-400">{calculateReadTime(post.content)}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
