"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { periodAPI, settingsAPI, AuthenticationError } from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LogPeriodPage() {
  const router = useRouter();
  const { toast, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [periodLength, setPeriodLength] = useState(5);
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Fetch user's period length setting
    const fetchPeriodLength = async () => {
      try {
        const settings = await settingsAPI.get();
        const settingsData = settings as unknown as { period_length: number };
        setPeriodLength(settingsData.period_length || 5);
      } catch (error) {
        console.error("Failed to fetch period length:", error);
        // Default to 5 days if fetch fails
        setPeriodLength(5);
      }
    };

    fetchPeriodLength();
  }, [router]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;

    if (startDate) {
      // Calculate end date as start_date + (period_length - 1)
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + periodLength - 1);

      // Format as YYYY-MM-DD
      const endDateStr = end.toISOString().split("T")[0];
      setEndDate(endDateStr);
    } else {
      setEndDate("");
    }
  };

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
      showSuccess("Period logged successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Failed to log period:", error);

      if (error instanceof AuthenticationError) {
        console.log("Authentication failed, redirecting to login");
        router.push("/login");
        return;
      }

      showError("Failed to log period. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
          />
        )}

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    onChange={handleStartDateChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Flow Intensity
                </label>
                <select
                  name="flow_intensity"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 bg-white font-medium"
                >
                  <option value="">Select intensity</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 placeholder-gray-400 bg-white resize-none"
                  placeholder="Add any observations or notes about this period..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? "Saving..." : "Log Period"}
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-200 text-center border-2 border-gray-300"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
