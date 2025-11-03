"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { deleteUser, updateUser } from "@/utils/adminApi";

const UserManagement = ({ initialUsers }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Calculate indexes
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // --- Update user role handler ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError(null);

    if (!currentUserToEdit || !currentUserToEdit.role) return;

    try {
      const updatedUserData = await updateUser(currentUserToEdit._id, {
        name: currentUserToEdit.name,
        role: currentUserToEdit.role,
      });

      setUsers(
        users.map((u) => (u._id === updatedUserData._id ? updatedUserData : u))
      );

      setIsEditing(false);
      setCurrentUserToEdit(null);
      setLoadingUpdate(false);
      setDeleteSuccess(
        `User ${updatedUserData.name}'s role updated to ${updatedUserData.role}.`
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoadingUpdate(false);
    }
  };

  // --- Delete user handler ---
  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to DELETE: ${userName}?`)) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((user) => user._id !== userId));
        setDeleteSuccess(`User ${userName} deleted successfully.`);
        setTimeout(() => setDeleteSuccess(null), 3000);
      } catch (err) {
        setError(err);
        setDeleteSuccess(null);
      }
    }
  };

  // --- Pagination Buttons ---
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Registered Users ({users.length})
      </h2>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      )}
      {deleteSuccess && (
        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          {deleteSuccess}
        </div>
      )}

      {/* --- Table --- */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user._id} className={user.role === "Admin" ? "bg-indigo-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user._id.substring(0, 6)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "Admin"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {userInfo?._id !== user._id && (
                    <>
                      <button
                        onClick={() => {
                          setCurrentUserToEdit({
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                          });
                          setIsEditing(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {isEditing && currentUserToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Edit User: {currentUserToEdit.name}
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  value={currentUserToEdit.email}
                  readOnly
                  className="w-full px-3 py-2 mt-1 bg-gray-100 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Change Role
                </label>
                <select
                  value={currentUserToEdit.role}
                  onChange={(e) =>
                    setCurrentUserToEdit({
                      ...currentUserToEdit,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                >
                  <option value="Regular User">Regular User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={loadingUpdate}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  disabled={loadingUpdate}
                >
                  {loadingUpdate ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
