"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { periodAPI } from "@/lib/api";
import Link from "next/link";

interface Period {
  id: number;
  start_date: string;
  end_date: string;
  flow_intensity: string;
  notes?: string;
}

export default function CycleHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchPeriods = async () => {
      try {
        const data = await periodAPI.list();
        setPeriods(data);
      } catch (error) {
        console.error("Failed to fetch periods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

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
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Log Period
            </Link>
            <Link
              href="/cycle-history"
              className="text-pink-600 hover:text-pink-700 font-medium"
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Cycle History</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {periods.length > 0 ? (
              periods.map((period) => (
                <div
                  key={period.id}
                  className="px-6 py-6 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {new Date(period.start_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Duration:</span>{" "}
                          {new Date(period.start_date).toLocaleDateString()} to{" "}
                          {new Date(period.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Flow Intensity:</span>{" "}
                          <span className="capitalize">
                            {period.flow_intensity}
                          </span>
                        </p>
                        {period.notes && (
                          <p className="text-gray-700">
                            <span className="font-medium">Notes:</span>{" "}
                            {period.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 space-x-2">
                      <Link
                        href={`/period/${period.id}`}
                        className="bg-pink-50 text-pink-600 hover:bg-pink-100 px-3 py-2 rounded font-medium transition"
                      >
                        View
                      </Link>
                      <Link
                        href={`/period/${period.id}/edit`}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded font-medium transition"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-600 mb-4">No periods logged yet</p>
                <Link
                  href="/log-period"
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 font-medium transition"
                >
                  Log Your First Period
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
