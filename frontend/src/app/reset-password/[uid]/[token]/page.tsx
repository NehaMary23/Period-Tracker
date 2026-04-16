"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({
  params,
}: {
  params: { uid: string; token: string };
}) {

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setSuccess(false);
    try {
      const res = await fetch(
        `https://period-tracker-kkyh.onrender.com/api/auth/password-reset-confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: params.uid,
            token: params.token,
            password,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("Password reset successful! You can now log in.");
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMsg(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border px-4 py-2 rounded"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            disabled={success}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-xs text-gray-500"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded font-semibold"
          disabled={loading || success}
        >
          {loading ? "Resetting..." : success ? "Password Reset" : "Reset Password"}
        </button>
        {msg && <div className={`mt-4 text-center ${success ? "text-green-600" : "text-rose-600"}`}>{msg}</div>}
      </form>
    </div>
  );
}
