"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { periodAPI } from "@/lib/api";
import Link from "next/link";

export default function LogPeriodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      flow_intensity: formData.get("flow_intensity"),
      notes: formData.get("notes"),
    };

    try {
      await periodAPI.create(data);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Failed to log period:", error);
      alert("Failed to log period. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Period Tracker</h1>
          <nav className="space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/log-period"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Log Period
            </Link>
            <Link
              href="/cycle-history"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              History
            </Link>
            <Link
              href="/settings"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Log Period</h2>
          <p className="text-gray-600 mb-8">Record your period details below</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow Intensity
              </label>
              <select
                name="flow_intensity"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select intensity</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                placeholder="Add any observations or notes about this period..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {loading ? "Saving..." : "Log Period"}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
