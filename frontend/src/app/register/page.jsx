"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authRequest,
  authSuccess,
  authFailure,
} from "@/redux/slices/authSlice";
import { register } from "@/utils/authApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const router = useRouter();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name || !email || !password)
      return dispatch(authFailure("Please fill in all fields."));
    if (password !== confirmPassword)
      return dispatch(authFailure("Passwords do not match."));

    dispatch(authRequest());
    try {
      const userData = await register(name, email, password);

      // Save user temporarily in Redux (unverified)
      dispatch(authSuccess({ ...userData, isVerified: false }));

      router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      dispatch(authFailure(msg));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Register New Account</h2>
        <form onSubmit={submitHandler} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-md ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
