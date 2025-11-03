"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBarComponent = ({ isMobile = false }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchKeyword.trim();

    if (keyword) {
      router.push(`/?keyword=${encodeURIComponent(keyword)}`);
      setSearchKeyword(""); // <--- CRITICAL FIX: Clear the input state
    } else if (router.pathname !== "/") {
      // If search is cleared and we are not on the homepage, go to homepage
      router.push(`/`);
      setSearchKeyword(""); // Clear on navigation too
    }
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`flex ${
        isMobile ? "order-last mt-4 border-t border-gray-700 pt-4" : "max-w-xs"
      }`}
    >
      <input
        type="search"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="Search posts..."
        className="w-full px-4 py-2 rounded-l-lg text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-r-lg bg-purple-600 hover:bg-purple-700 transition-colors shadow-md"
        aria-label="Search"
      >
        🔍
      </button>
    </form>
  );
};

export default SearchBarComponent;
