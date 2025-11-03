"use client";

import { useState } from "react";
import ProfileDetails from "./ProfileDetails"; // FR-2.1
import MyPosts from "./MyPosts"; // FR-2.2

const UserDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("posts");

  const tabs = [
    { id: "posts", label: "My Blog Posts" },
    { id: "profile", label: "Profile Details" },
    // Could add 'My Comments' here if FR demanded it.
  ];

  return (
    <div className="mt-8">
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
      <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
        {activeTab === "posts" && <MyPosts />}
        {activeTab === "profile" && <ProfileDetails />}
      </div>
    </div>
  );
};

export default UserDashboardTabs;
