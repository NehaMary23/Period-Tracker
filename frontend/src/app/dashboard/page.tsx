"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { statsAPI, periodAPI } from "@/lib/api";
import Link from "next/link";

interface CycleInfo {
  current_day?: number;
  cycle_length?: number;
  next_period_date?: string;
  last_period_date?: string;
}

interface Period {
  id: number;
  start_date: string;
  end_date: string;
  flow_intensity: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [info, periodData] = await Promise.all([
          statsAPI.getCycleInfo().catch(() => ({})),
          periodAPI.list().catch(() => []),
        ]);
        setCycleInfo(info);
        setPeriods(periodData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-pink-100">
            Keep track of your cycle and monitor your health
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Day */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Current Cycle Day
            </div>
            <div className="text-4xl font-bold text-pink-600">
              {cycleInfo?.current_day || "—"}
            </div>
            <p className="text-gray-600 text-sm mt-2">
              of {cycleInfo?.cycle_length || 28} days
            </p>
          </div>

          {/* Next Period */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Predicted Next Period
            </div>
            <div className="text-xl font-bold text-gray-900 mt-2">
              {cycleInfo?.next_period_date
                ? new Date(cycleInfo.next_period_date).toLocaleDateString()
                : "Not yet calculated"}
            </div>
          </div>

          {/* Last Period */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Last Period
            </div>
            <div className="text-xl font-bold text-gray-900 mt-2">
              {cycleInfo?.last_period_date
                ? new Date(cycleInfo.last_period_date).toLocaleDateString()
                : "Not recorded"}
            </div>
          </div>
        </div>

        {/* Recent Periods */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Periods
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {periods.length > 0 ? (
              periods.slice(0, 5).map((period) => (
                <div
                  key={period.id}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(period.start_date).toLocaleDateString()} -{" "}
                        {new Date(period.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Flow:{" "}
                        <span className="capitalize">
                          {period.flow_intensity}
                        </span>
                      </p>
                    </div>
                    <Link
                      href={`/period/${period.id}`}
                      className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-600">
                <p>
                  No periods logged yet. Start by logging your first period!
                </p>
                <Link
                  href="/log-period"
                  className="text-pink-600 hover:text-pink-700 font-medium mt-2 inline-block"
                >
                  Log Period →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
