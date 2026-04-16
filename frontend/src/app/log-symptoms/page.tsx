"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { statsAPI, AuthenticationError } from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

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
  phase?: PhaseInfo;
}

const COMMON_SYMPTOMS = {
  menstruation: [
    "Cramps",
    "Fatigue",
    "Heavy bleeding",
    "Back pain",
    "Headache",
  ],
  follicular: [
    "Energy increase",
    "Mood improvement",
    "Acne clearing",
    "Increased appetite",
    "Clearer skin",
  ],
  ovulation: [
    "Energy peak",
    "Increased libido",
    "Increased appetite",
    "Body temperature rise",
    "Mood elevation",
  ],
  luteal: [
    "Bloating",
    "Mood swings",
    "Fatigue",
    "Cravings",
    "Breast tenderness",
    "Anxiety",
    "Irritability",
  ],
};

export default function LogSymptomsPage() {
  const router = useRouter();
  const { toast, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const info = await statsAPI.getCycleInfo();
        setCycleInfo(info);
      } catch (error) {
        console.error("Failed to fetch cycle info:", error);

        if (error instanceof AuthenticationError) {
          router.push("/login");
          return;
        }

        showError("Failed to load cycle information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, showError]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      showSuccess("Symptoms logged successfully!");
      // Reset form
      setSelectedSymptoms([]);
      setNotes("");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Failed to log symptoms:", error);
      showError("Failed to log symptoms. Please try again.");
    } finally {
      setSubmitting(false);
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
              Loading...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cycleInfo?.phase) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-6 text-lg">
              Please log a period first to track symptoms
            </p>
            <Link
              href="/log-period"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 inline-block"
            >
              Log Period
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const phaseSymptoms =
    COMMON_SYMPTOMS[cycleInfo.phase.phase as keyof typeof COMMON_SYMPTOMS] ||
    [];

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
        <main className="max-w-3xl mx-auto px-6 py-8">
          {/* Phase Info Card */}
          <div
            className={`bg-white rounded-lg shadow-md border-l-4 p-6 mb-8 ${
              cycleInfo.phase.color === "rose"
                ? "border-l-rose-600"
                : cycleInfo.phase.color === "blue"
                  ? "border-l-rose-600"
                  : cycleInfo.phase.color === "amber"
                    ? "border-l-rose-600"
                    : "border-l-rose-600"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    cycleInfo.phase.color === "rose"
                      ? "text-rose-600"
                      : cycleInfo.phase.color === "blue"
                        ? "text-rose-600"
                        : cycleInfo.phase.color === "amber"
                          ? "text-rose-600"
                          : "text-rose-600"
                  }`}
                >
                  {cycleInfo.phase.name}
                </h2>
              </div>
              <div
                className={`text-center ${
                  cycleInfo.phase.color === "rose"
                    ? "text-rose-600"
                    : cycleInfo.phase.color === "blue"
                      ? "text-rose-600"
                      : cycleInfo.phase.color === "amber"
                        ? "text-rose-600"
                        : "text-rose-600"
                }`}
              >
                <div className="text-3xl font-bold">{cycleInfo.phase.day}</div>
                <div className="text-sm">of {cycleInfo.cycle_length} days</div>
              </div>
            </div>
            <p className="text-gray-700">{cycleInfo.phase.description}</p>
          </div>

          {/* Symptoms Form */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Log Symptoms
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Symptoms for Phase */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4">
                  Common Symptoms for {cycleInfo.phase.name} Phase
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {phaseSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-4 rounded-lg border-2 transition duration-200 text-left flex items-center justify-between ${
                        selectedSymptoms.includes(symptom)
                          ? "border-rose-600 bg-rose-50"
                          : "border-gray-200 bg-white hover:border-rose-300"
                      }`}
                    >
                      <span className="font-medium">{symptom}</span>
                      {selectedSymptoms.includes(symptom) && (
                        <CheckCircle
                          size={20}
                          className="text-rose-600 flex-shrink-0"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Symptoms Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Other Symptoms or Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 placeholder-gray-400 bg-white resize-none"
                  placeholder="Add any other symptoms or notes..."
                />
              </div>

              {/* Selected Symptoms Summary */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-rose-900 mb-2">
                    Selected Symptoms:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="inline-block px-3 py-1 bg-rose-200 text-rose-900 rounded-full text-sm font-medium"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  {submitting ? "Saving..." : "Log Symptoms"}
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
