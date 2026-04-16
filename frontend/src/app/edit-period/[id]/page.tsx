"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { periodAPI, settingsAPI, AuthenticationError } from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";

interface Period {
  id: number;
  start_date: string;
  end_date: string;
  flow_intensity: string;
  notes?: string;
}

export default function EditPeriodPage() {
  const router = useRouter();
  const params = useParams();
  const { toast, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState<Period | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowIntensity, setFlowIntensity] = useState("");
  const [notes, setNotes] = useState("");
  const [periodLength, setPeriodLength] = useState(5);

  const periodId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Only fetch if we haven't loaded the period yet
    if (period) {
      return;
    }

    const fetchData = async () => {
      try {
        const [periodData, settingsData] = await Promise.all([
          periodAPI.get(periodId),
          settingsAPI.get(),
        ]);
        const loadedPeriod = periodData as unknown as Period;
        const settings = settingsData as unknown as { period_length: number };
        setPeriod(loadedPeriod);

        // Ensure dates are in YYYY-MM-DD format for date inputs
        const formatDate = (dateStr: string) => {
          if (!dateStr) return "";
          // Extract just the date part if it includes time
          return dateStr.split("T")[0];
        };

        const formattedStartDate = formatDate(loadedPeriod.start_date);
        const formattedEndDate = formatDate(loadedPeriod.end_date);

        console.log("Setting form values:", {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          flowIntensity: loadedPeriod.flow_intensity,
          notes: loadedPeriod.notes,
        });

        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
        setFlowIntensity(loadedPeriod.flow_intensity);
        setNotes(loadedPeriod.notes || "");
        setPeriodLength(settings.period_length || 5);
      } catch (error) {
        console.error("Failed to fetch data:", error);

        if (error instanceof AuthenticationError) {
          router.push("/login");
          return;
        }

        showError("Failed to load period data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodId]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    console.log("Start date changed to:", newStartDate);
    setStartDate(newStartDate);

    if (newStartDate) {
      // Calculate end date as start_date + (period_length - 1)
      // Parse the date string (YYYY-MM-DD format from date input)
      const [year, month, day] = newStartDate.split("-").map(Number);
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + periodLength - 1);

      // Format as YYYY-MM-DD for the input
      const year2 = end.getFullYear();
      const month2 = String(end.getMonth() + 1).padStart(2, "0");
      const day2 = String(end.getDate()).padStart(2, "0");
      const endDateStr = `${year2}-${month2}-${day2}`;

      console.log("End date calculated:", endDateStr);
      setEndDate(endDateStr);
    } else {
      setEndDate("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!period) return;

    // Validate form data
    if (!startDate || !endDate || !flowIntensity) {
      showError("Please fill in all required fields");
      return;
    }

    setSaving(true);

    const data = {
      start_date: startDate,
      end_date: endDate,
      flow_intensity: flowIntensity,
      notes: notes || "",
    };

    console.log("Submitting period update:", { periodId, data });

    try {
      const result = await periodAPI.update(periodId, data);
      console.log("Update successful:", result);
      showSuccess("Period updated successfully!");
      setTimeout(() => {
        router.push("/cycle-history");
      }, 1000);
    } catch (error) {
      console.error("Failed to update period:", error);

      if (error instanceof AuthenticationError) {
        router.push("/login");
        return;
      }

      showError(
        error instanceof Error
          ? error.message
          : "Failed to update period. Please try again.",
      );
      setSaving(false);
    }
  };

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
              Loading period data...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!period) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-6 text-lg">Period not found</p>
            <Link
              href="/cycle-history"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 inline-block"
            >
              Back to History
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Period
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    required
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
                  value={flowIntensity}
                  onChange={(e) => setFlowIntensity(e.target.value)}
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 placeholder-gray-400 bg-white resize-none"
                  placeholder="Add any observations or notes about this period..."
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href="/cycle-history"
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
