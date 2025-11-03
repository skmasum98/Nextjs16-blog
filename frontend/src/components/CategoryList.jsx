"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCategories } from "@/utils/categoryApi"; // Public API

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        // Optionally limit to a top X categories here
        setCategories(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  if (error)
    return <p className="text-sm text-red-500">Error loading categories.</p>;
  if (categories.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
        Top Categories
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            // Link to the dedicated category page
            href={`/category/${cat.slug}`}
            className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
