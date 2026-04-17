"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { periodAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { History } from "lucide-react";
import Footer from "@/components/Footer";

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
        setPeriods(data as unknown as Period[]);
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
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-rose-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Loading your cycle history...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {periods.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {periods.map((period) => (
                  <div
                    key={period.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition duration-200 bg-white"
                  >
                    <div className="mb-4">
                      <h3
                        className="font-bold text-gray-900 mb-1"
                        style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
                      >
                        {new Date(period.start_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </h3>
                      <p
                        className="text-gray-600"
                        style={{ fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)" }}
                      >
                        {new Date(period.start_date).toLocaleDateString()} to{" "}
                        {new Date(period.end_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <span
                          className="font-bold text-gray-700 uppercase tracking-wider"
                          style={{ fontSize: "clamp(0.65rem, 1vw, 0.75rem)" }}
                        >
                          Flow Intensity
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-bold ${
                              period.flow_intensity === "light"
                                ? "bg-blue-100 text-blue-700"
                                : period.flow_intensity === "moderate"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                            style={{
                              fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)",
                            }}
                          >
                            {period.flow_intensity.charAt(0).toUpperCase() +
                              period.flow_intensity.slice(1)}
                          </span>
                        </div>
                      </div>

                      {period.notes && (
                        <div>
                          <span
                            className="font-bold text-gray-700 uppercase tracking-wider"
                            style={{ fontSize: "clamp(0.65rem, 1vw, 0.75rem)" }}
                          >
                            Notes
                          </span>
                          <p
                            className="mt-1 text-gray-600 line-clamp-2"
                            style={{
                              fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)",
                            }}
                          >
                            {period.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/edit-period/${period.id}`}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 text-center block"
                      style={{ fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)" }}
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <History size={48} className="mx-auto mb-4 text-gray-400" />
              <p
                className="text-gray-600 mb-6"
                style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}
              >
                No periods logged yet
              </p>
              <Link
                href="/log-period"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 inline-block"
                style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}
              >
                Log Your First Period
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
