"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { settingsAPI } from "@/lib/api";
import Link from "next/link";

interface Settings {
  cycle_length?: number;
  period_length?: number;
  send_notifications?: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.get();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
      cycle_length: parseInt(formData.get("cycle_length") as string) || 28,
      period_length: parseInt(formData.get("period_length") as string) || 5,
      send_notifications: formData.get("send_notifications") === "on",
    };

    try {
      await settingsAPI.update(updatedSettings);
      setSettings(updatedSettings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600 mb-8">
            Configure your cycle tracking preferences
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Cycle Length (days)
                </label>
                <input
                  type="number"
                  name="cycle_length"
                  min="20"
                  max="40"
                  defaultValue={settings.cycle_length || 28}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Period Length (days)
                </label>
                <input
                  type="number"
                  name="period_length"
                  min="1"
                  max="10"
                  defaultValue={settings.period_length || 5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="send_notifications"
                  id="notifications"
                  defaultChecked={settings.send_notifications || false}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="notifications"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  Send me notifications about upcoming periods
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {saving ? "Saving..." : "Save Settings"}
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
