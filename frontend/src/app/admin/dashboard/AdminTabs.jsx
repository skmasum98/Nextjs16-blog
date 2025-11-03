"use client";

import { useState } from "react";
import UserManagement from "./UserManagement"; // This is the logic we already wrote
import PostManagement from "./PostManagement"; // We will create this next
import CommentManagement from "./CommentManagement"; // We will create this after
import CategoryManagement from "./CategoryManagement";

const AdminTabs = ({ initialUsers }) => {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", label: "User Management" },
    { id: "posts", label: "Post Moderation " },
    { id: "categories", label: "Category Management" },
    { id: "comments", label: "Comment Moderation " },
  ];

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tabs Content */}
      <div className="mt-8">
        {activeTab === "users" && (
          <UserManagement initialUsers={initialUsers} />
        )}
        {activeTab === "posts" && <PostManagement />}
        {activeTab === "categories" && <CategoryManagement />}
        {activeTab === "comments" && <CommentManagement />}
      </div>
    </div>
  );
};

export default AdminTabs;
