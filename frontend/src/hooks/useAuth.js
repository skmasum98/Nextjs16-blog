"use client";
import { useSelector, useDispatch } from "react-redux";
import { logout, authSuccess } from "@/redux/slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // token can be accessed from userInfo
  const token = userInfo?.token || null;
  const user = userInfo?.user || null;

  const setUser = (newUser) => {
    const updatedUserInfo = { ...userInfo, user: newUser };
    dispatch(authSuccess(updatedUserInfo));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    setUser,
    loading,
    error,
    handleLogout,
  };
};

export default useAuth;
