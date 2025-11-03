"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/utils/authApi";
import { authSuccess } from "@/redux/slices/authSlice";

const ResetPasswordPage = () => {
  const params = useParams();
  const token = params.token;

  const dispatch = useDispatch();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, password);

      // Ensure we always have a string message
      setMessage(res?.message || "Password reset successful!");
      console.log(message);
        

      if (res?.user?.token) {
        // Save user info in localStorage
        localStorage.setItem("userInfo", JSON.stringify(res?.user));

        // Update Redux state
        dispatch(authSuccess(res?.user));

        // Redirect to dashboard/home
        setTimeout(() => router.push("/"), 1500);
      } else {
        // Redirect to login if no token returned
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      // Ensure error is always a string
      const errorMessage =
        (err?.response && err?.response?.data && err?.response?.data?.message) ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-20 text-red-600">
        Error: Missing reset token.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Set New Password</h2>

        {message && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
