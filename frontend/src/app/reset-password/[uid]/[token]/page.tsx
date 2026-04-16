"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }: { params: { uid: string, token: string } }) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch(`http://localhost:8000/api/auth/password-reset-confirm/${params.uid}/${params.token}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Password reset successful! You can now log in.");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setMsg(data.error || "Failed to reset password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input
          type="password"
          className="w-full border px-4 py-2 rounded mb-4"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {msg && <div className="mt-4 text-center text-rose-600">{msg}</div>}
      </form>
    </div>
  );
}
