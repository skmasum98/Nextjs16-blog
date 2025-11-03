"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import UserDashboardTabs from "./components/UserDashboardTabs";

const ProfilePage = () => {
  const { userInfo, loading: authLoading } = useSelector((state) => state.auth);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isMounted && !authLoading && !userInfo) {
      router.push("/login?redirect=/profile");
    }
  }, [isMounted, authLoading, userInfo, router]);

  if (!isMounted || authLoading || !userInfo) {
    return <div className="text-center py-20">Loading Profile...</div>;
  }

  return (
    <div className="py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Welcome, {userInfo.name}
      </h1>
      <UserDashboardTabs />
    </div>
  );
};

export default ProfilePage;
