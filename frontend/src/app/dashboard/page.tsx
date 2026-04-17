"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { statsAPI, periodAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import CycleProgressCard from "@/components/CycleProgressCard";
import PeriodTable from "@/components/PeriodTable";
import Link from "next/link";
import { Calendar, BarChart3, Droplets, Clock, Plus } from "lucide-react";
import Footer from "@/components/Footer";

interface PhaseInfo {
  phase: string;
  name: string;
  description: string;
  color: string;
  day?: number;
  days_remaining?: number;
}

interface CycleInfo {
  current_day?: number;
  cycle_length?: number;
  next_period_date?: string;
  last_period_date?: string;
  phase?: PhaseInfo;
}

interface Period {
  id: number;
  start_date: string;
  end_date: string;
  flow_intensity: string;
  notes?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [showPhaseModal, setShowPhaseModal] = useState(false);

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
        setPeriods(periodData as unknown as Period[]);
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-rose-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Loading your dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasData = periods.length > 0 && cycleInfo?.current_day;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className="font-bold text-gray-900 mb-2"
                  style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)" }}
                >
                  Your Cycle Dashboard
                </h1>
                <p
                  className="text-gray-600"
                  style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
                >
                  Track your menstrual cycle and stay informed about your health
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link
                  href="/log-period"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                >
                  <Plus size={20} />
                  Log Period
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Current Day"
              value={cycleInfo?.current_day || "—"}
              subtitle={
                cycleInfo?.cycle_length
                  ? `of ${cycleInfo.cycle_length} days`
                  : "Log period to track"
              }
              icon={Calendar}
              variant={cycleInfo?.current_day ? "highlight" : "default"}
            />
            <StatCard
              label="Cycle Length"
              value={`${cycleInfo?.cycle_length || 28} days`}
              subtitle="Your average cycle"
              icon={BarChart3}
              variant="default"
            />
            <StatCard
              label="Last Period"
              value={
                cycleInfo?.last_period_date
                  ? new Date(cycleInfo.last_period_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )
                  : "Not recorded"
              }
              subtitle="Most recent period start"
              icon={Droplets}
              variant={cycleInfo?.last_period_date ? "default" : "warning"}
            />
            <StatCard
              label="Next Period"
              value={
                cycleInfo?.next_period_date
                  ? new Date(cycleInfo.next_period_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )
                  : "Not calculated"
              }
              subtitle="Predicted date"
              icon={Clock}
              variant={cycleInfo?.next_period_date ? "highlight" : "default"}
            />
          </div>

          {/* Cycle Progress */}
          <div className="mb-8">
            <CycleProgressCard
              currentDay={cycleInfo?.current_day}
              cycleLength={cycleInfo?.cycle_length || 28}
              nextPeriodDate={cycleInfo?.next_period_date}
            />
          </div>

          {/* Cycle Phase Display */}
          {cycleInfo?.phase && (
            <div
              onClick={() => setShowPhaseModal(true)}
              className={`mb-8 bg-white rounded-lg shadow-md border-l-4 p-4 sm:p-6 lg:p-8 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-2 ${
                cycleInfo.phase.color === "rose"
                  ? "border-l-rose-600"
                  : cycleInfo.phase.color === "blue"
                    ? "border-l-rose-600"
                    : cycleInfo.phase.color === "amber"
                      ? "border-l-rose-600"
                      : "border-l-rose-600"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                <div className="flex-1">
                  <h2
                    className={`font-bold mb-2 ${
                      cycleInfo.phase.color === "rose"
                        ? "text-rose-600"
                        : cycleInfo.phase.color === "blue"
                          ? "text-rose-600"
                          : cycleInfo.phase.color === "amber"
                            ? "text-rose-600"
                            : "text-rose-600"
                    }`}
                    style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
                  >
                    {cycleInfo.phase.name}
                  </h2>
                  <p 
                    className="text-gray-700 mb-4"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
                  >
                    {cycleInfo.phase.description}
                  </p>
                  {cycleInfo.phase.day && (
                    <div 
                      className="text-gray-600"
                      style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}
                    >
                      <span className="font-semibold">
                        Day {cycleInfo.phase.day}
                      </span>
                      {cycleInfo.phase.days_remaining && (
                        <span> of {cycleInfo.cycle_length} days</span>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className={`flex-shrink-0 rounded-full flex flex-col items-center justify-center ${
                    cycleInfo.phase.color === "rose"
                      ? "bg-rose-50 text-rose-400"
                      : cycleInfo.phase.color === "blue"
                        ? "bg-rose-50 text-rose-400"
                        : cycleInfo.phase.color === "amber"
                          ? "bg-rose-50 text-rose-400"
                          : "bg-rose-50 text-rose-400"
                  }`}
                  style={{ width: "clamp(4rem, 12vw, 6rem)", height: "clamp(4rem, 12vw, 6rem)" }}
                >
                  <div 
                    className="font-bold"
                    style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
                  >
                    {(() => {
                      const d = cycleInfo.phase.day;
                      if (!d) return "—";
                      if (cycleInfo.phase.phase === "menstruation") return d;
                      if (cycleInfo.phase.phase === "follicular") return d - 5;
                      if (cycleInfo.phase.phase === "ovulation") return 1;
                      if (cycleInfo.phase.phase === "luteal") return d - 14;
                      return d;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Periods Table */}
          <PeriodTable periods={periods} />

          {/* Phase Info Modal */}
          {showPhaseModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Understanding Your Cycle Phases
                    </h2>
                    <button
                      onClick={() => setShowPhaseModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-l-4 border-l-rose-600 pl-4">
                      <h3 className="font-bold text-rose-600 mb-2 text-lg">
                        Menstruation
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">Days 1-5</p>
                      <p className="text-sm text-gray-500">
                        Shedding uterine lining
                      </p>
                    </div>
                    <div className="border-l-4 border-l-blue-600 pl-4">
                      <h3 className="font-bold text-blue-600 mb-2 text-lg">
                        Follicular
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">Days 1-13</p>
                      <p className="text-sm text-gray-500">
                        Hormone levels rising
                      </p>
                    </div>
                    <div className="border-l-4 border-l-amber-600 pl-4">
                      <h3 className="font-bold text-amber-600 mb-2 text-lg">
                        Ovulation
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">Day 14</p>
                      <p className="text-sm text-gray-500">Most fertile day</p>
                    </div>
                    <div className="border-l-4 border-l-purple-600 pl-4">
                      <h3 className="font-bold text-purple-600 mb-2 text-lg">
                        Luteal
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">Days 15-28</p>
                      <p className="text-sm text-gray-500">
                        Progesterone rises
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPhaseModal(false)}
                    className="mt-8 w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
