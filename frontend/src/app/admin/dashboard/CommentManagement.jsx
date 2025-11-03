"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken } from "@/utils/postApi";
import { deleteCommentAdmin, toggleCommentSuspend } from "@/utils/adminApi";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch all comments (admin)
const fetchAllCommentsAdmin = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Not authorized, token missing");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/comments/all-admin`, config);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 6;

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await fetchAllCommentsAdmin();
        setComments(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    loadComments();
  }, []);

  const handleAction = async (commentId, action, postTitle) => {
    let actionFunc =
      action === "delete" ? deleteCommentAdmin : toggleCommentSuspend;
    let confirmation =
      action === "delete"
        ? `Are you sure you want to DELETE this comment?`
        : `Are you sure you want to change the suspension status for this comment?`;

    if (window.confirm(confirmation)) {
      try {
        setMessage(null);
        const result = await actionFunc(commentId);

        setComments((prev) =>
          prev
            .map((c) => {
              if (c._id === commentId) {
                if (action === "delete") return null;
                return { ...c, isSuspended: result };
              }
              return c;
            })
            .filter((c) => c !== null)
        );

        setMessage(
          `Comment successfully ${
            action === "delete" ? "deleted" : result ? "suspended" : "activated"
          }.`
        );
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setError(err);
        setMessage(null);
      }
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading All Comments...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  // Pagination logic
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const indexOfLast = currentPage * commentsPerPage;
  const indexOfFirst = indexOfLast - commentsPerPage;
  const currentComments = comments.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Comment Moderation ({comments.length} Total)
      </h2>

      {message && (
        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          {message}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commenter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Post Context
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentComments.map((comment) => (
              <tr
                key={comment._id}
                className={comment.isSuspended ? "bg-red-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {comment.user ? comment.user.name : "Deleted User"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
                  {comment.content.substring(0, 50)}...
                </td>
                <td className="px-6 py-4 text-sm text-blue-600 hover:underline">
                  <Link href={`/posts/${comment.post.slug}`}>
                    {comment.post.title.substring(0, 20)}...
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      comment.isSuspended
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {comment.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() =>
                      handleAction(comment._id, "suspend", comment.post.title)
                    }
                    className={`${
                      comment.isSuspended ? "text-green-600" : "text-yellow-600"
                    } hover:text-yellow-800`}
                  >
                    {comment.isSuspended ? "Activate" : "Suspend"}
                  </button>

                  <button
                    onClick={() =>
                      handleAction(comment._id, "delete", comment.post.title)
                    }
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-sm font-medium rounded ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          Prev
        </button>

        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-sm font-medium rounded ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CommentManagement;
