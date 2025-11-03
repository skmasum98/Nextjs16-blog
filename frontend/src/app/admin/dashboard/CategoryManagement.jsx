'use client';

import { useState, useEffect } from 'react';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/utils/categoryApi';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // You can change this to 10, 15, etc.

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Add Category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createCategory(newCategoryName.trim());
      setCategories([...categories, newCat]);
      setNewCategoryName('');
      setMessage(`Category '${newCat.name}' created.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Delete Category
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category: ${name}?`))
      return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      setMessage(`Category '${name}' deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Update Category
  const handleUpdate = async () => {
    if (!editingCategory.name.trim()) return;
    try {
      const updatedCat = await updateCategory(
        editingCategory._id,
        editingCategory.name.trim()
      );
      setCategories(
        categories.map((c) =>
          c._id === updatedCat._id ? updatedCat : c
        )
      );
      setEditingCategory(null);
      setMessage(`Category '${updatedCat.name}' updated.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) return <div className="py-10">Loading Categories...</div>;
  if (error && !message)
    return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Category Management (Admin)</h2>

      {message && (
        <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">
          {message}
        </div>
      )}

      {/* Add New Category */}
      <form
        onSubmit={handleAdd}
        className="flex space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm"
      >
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Enter new category name"
          className="grow px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Category
        </button>
      </form>

      {/* Category List */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCategories.map((cat) => (
              <tr key={cat._id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {editingCategory?._id === cat._id ? (
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                      className="border rounded-md px-2 py-1"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {cat.slug}
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-3">
                  {editingCategory?._id === cat._id ? (
                    <button
                      onClick={handleUpdate}
                      className="text-green-600 hover:text-green-900"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setEditingCategory({ _id: cat._id, name: cat.name })
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded-md ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
