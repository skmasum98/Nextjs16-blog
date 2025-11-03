// blog-application/frontend/src/app/admin/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchAllUsers } from "@/utils/adminApi";
import AdminTabs from "./AdminTabs"; // <-- NEW IMPORT

const AdminDashboardPage = () => {
  const { userInfo, loading: authLoading } = useSelector((state) => state.auth);
  const router = useRouter();

  const [users, setUsers] = useState([]); // Store users here to pass to the tab component
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Access Protection (NFR-4.1.1) ---
  useEffect(() => {
    if (authLoading || userInfo === undefined) return;

    if (!userInfo || userInfo.role !== "Admin") {
      router.push("/");
      return;
    }

    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    loadUsers();
  }, [userInfo, authLoading, router]);

  if (loading || authLoading)
    return <div className="text-center py-20">Loading Admin Dashboard...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">ERROR: {error}</div>;

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Render the Tabs component with the initial user data */}
      <AdminTabs initialUsers={users} />
    </div>
  );
};

export default AdminDashboardPage;
