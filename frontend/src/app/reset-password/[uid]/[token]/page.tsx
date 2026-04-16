"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ uid: string; token: string }>;
}) {
  const { uid, token } = use(params);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        uidb64: uid,
        token: token,
        password,
      };
      console.log("Reset password payload:", payload);
      const res = await fetch(
        `https://period-tracker-kkyh.onrender.com/api/auth/password-reset-confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      console.log("Reset password response:", data);
      if (res.ok) {
        setMsg("Password reset successful! You can now log in.");
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMsg(
          data.error ||
            data.detail ||
            JSON.stringify(data) ||
            "Failed to reset password.",
        );
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-rose-100">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-3">
            {/* Lock icon only */}
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="8" rx="2" fill="#fff" stroke="#e11d48" strokeWidth="2"/>
              <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M12 15v2" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-rose-700 mb-1 tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-gray-500 text-center text-base">
            Create a new password for your account.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
          aria-label="Reset Password Form"
        >
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border border-rose-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-black placeholder-gray-400 bg-white"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              disabled={success}
              aria-label="New password"
              style={{ color: "#111" }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-rose-400 hover:text-rose-600"
              tabIndex={-1}
              onClick={() => setShowPassword((v: boolean) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.584 10.587A3 3 0 0 0 12 15a3 3 0 0 0 2.995-2.824M6.53 6.53A8.962 8.962 0 0 0 2.458 12c1.274 4.057 5.064 7 9.542 7 1.7 0 3.3-.37 4.712-1.03M17.472 17.47A8.962 8.962 0 0 0 21.543 12c-.456-1.453-1.24-2.77-2.29-3.81M9.88 9.88A3 3 0 0 1 15 12c0 .414-.08.81-.224 1.175"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full border border-rose-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition text-black placeholder-gray-400 bg-white"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              disabled={success}
              aria-label="Confirm new password"
              style={{ color: "#111" }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-rose-400 hover:text-rose-600"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v: boolean) => !v)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.584 10.587A3 3 0 0 0 12 15a3 3 0 0 0 2.995-2.824M6.53 6.53A8.962 8.962 0 0 0 2.458 12c1.274 4.057 5.064 7 9.542 7 1.7 0 3.3-.37 4.712-1.03M17.472 17.47A8.962 8.962 0 0 0 21.543 12c-.456-1.453-1.24-2.77-2.29-3.81M9.88 9.88A3 3 0 0 1 15 12c0 .414-.08.81-.224 1.175"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 shadow-sm"
            disabled={loading || success}
            aria-disabled={loading || success}
          >
            {loading
              ? "Resetting..."
              : success
                ? "Password Reset"
                : "Reset Password"}
          </button>
          {msg && (
            <div
              className={`mt-2 text-center text-base ${success ? "text-green-600" : "text-rose-600"}`}
              role="alert"
              aria-live="polite"
            >
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
