"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  authRequest,
  authSuccess,
  authFailure,
} from "@/redux/slices/authSlice";
import { login } from "@/utils/authApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password)
      return dispatch(authFailure("Please fill in all fields"));

    dispatch(authRequest());
    try {
      const userData = await login(email, password);
       setMessage(userData?.message || "If your email exists, a reset link has been sent.");

      // ✅ Save only after verified
      localStorage.setItem("userInfo", JSON.stringify(userData));
      dispatch(authSuccess(userData));
      router.push("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      dispatch(authFailure(msg));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
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
        
        <form onSubmit={submitHandler} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Login
          </button>
        </form>

        <div className="flex justify-around  text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Forgot Password?
          </Link>
          <Link
            href="/verify-email"
            className="text-blue-600 hover:text-blue-500"
          >
            Verify Email Here
          </Link>
        </div>
        <p className="text-sm text-center">
          New User?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-500">
            Register Here
          </Link>
        </p>
        

      </div>
    </div>
  );
};

export default LoginPage;
