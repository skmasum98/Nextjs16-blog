"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDispatch } from "react-redux";
import { authSuccess } from "@/redux/slices/authSlice";

const VerifyEmailComponent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("Enter your verification code");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Prefill email from query params
  useEffect(() => {
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, [params]);

  // Verify email with code
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      setError("Please provide both email and verification code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/verifyEmail`,
        { email, code }
      );

      if (res.data?.user?.token) {
        // Save token & update Redux
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        dispatch(authSuccess(res.data.user));
        setMessage("Email verified successfully! Redirecting...");
        setTimeout(() => router.push("/"), 1500);
      } else {
        setMessage("Email verified. Please login.");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email to resend code.");
      return;
    }

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/resendVerificationCode`,
        { email }
      );
      setMessage(res.data.message || "Verification code sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>

        {message && (
          <p className="p-2 mb-2 text-blue-700 bg-blue-100 rounded">
            {message}
          </p>
        )}
        {error && (
          <p className="p-2 mb-2 text-red-600 bg-red-100 rounded">{error}</p>
        )}

        <form onSubmit={handleVerify} className="space-y-4 mt-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter verification code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          Didn’t receive the code?
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="ml-2 text-blue-600 hover:underline"
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailComponent;
