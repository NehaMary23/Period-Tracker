"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout, getUser, setUser } from "@/lib/auth";
import { settingsAPI, AuthenticationError } from "@/lib/api";
import { Toast, useToast } from "@/components/Toast";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LogOut } from "lucide-react";
import Footer from "@/components/Footer";

interface Settings {
  cycle_length?: number;
  period_length?: number;
  send_notifications?: boolean;
  email?: string;
  username?: string;
}

interface AccountData {
  username: string;
  email: string;
  password: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast, showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [settings, setSettings] = useState<Settings>({});
  const [accountData, setAccountData] = useState<AccountData>({
    username: "",
    email: "",
    password: "",
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        // Get current user from sessionStorage
        const currentUser = getUser();
        console.log("Current user:", currentUser);

        const data = await settingsAPI.get();
        console.log("Settings data:", data);
        const settingsData = data as Settings;
        setSettings(settingsData);
        setNotificationsEnabled(settingsData.send_notifications || false);

        // Use current user data from sessionStorage if available
        setAccountData({
          username: currentUser?.username || settingsData.username || "",
          email: currentUser?.email || settingsData.email || "",
          password: "",
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);

        // Handle authentication errors by redirecting to login
        if (error instanceof AuthenticationError) {
          console.log("Authentication failed, redirecting to login");
          router.push("/login");
          return;
        }

        // Use cached user data from sessionStorage if available
        const currentUser = getUser();
        if (currentUser) {
          setAccountData({
            username: currentUser.username || "",
            email: currentUser.email || "",
            password: "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingAccount(true);

    const updatedAccount = {
      username: accountData.username,
      email: accountData.email,
      ...(accountData.password && { password: accountData.password }),
    };

    try {
      await settingsAPI.update(updatedAccount);
      // Update user in sessionStorage
      const updatedUser = {
        id: getUser()?.id || 0,
        username: accountData.username,
        email: accountData.email,
      };
      setUser(updatedUser);
      setAccountData((prev) => ({ ...prev, password: "" }));
      setShowPasswordForm(false);
      showSuccess("Account settings updated successfully!");
    } catch (error) {
      console.error("Failed to update account:", error);

      // Handle authentication errors by redirecting to login
      if (error instanceof AuthenticationError) {
        console.log("Authentication failed, redirecting to login");
        router.push("/login");
        return;
      }

      showError("Failed to update account. Please try again.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const updatedSettings = {
      cycle_length:
        parseInt(
          (
            e.currentTarget.elements.namedItem(
              "cycle_length",
            ) as HTMLInputElement
          ).value,
        ) || 28,
      period_length:
        parseInt(
          (
            e.currentTarget.elements.namedItem(
              "period_length",
            ) as HTMLInputElement
          ).value,
        ) || 5,
      send_notifications: notificationsEnabled,
    };

    try {
      await settingsAPI.update(updatedSettings);
      setSettings(updatedSettings);
      showSuccess("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
              Loading your settings...
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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
          />
        )}

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-6 py-8">
          {/* Account Settings Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Settings
            </h2>
            <p className="text-gray-600 mb-6">
              Update your account information
            </p>

            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Username
                </label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) =>
                    setAccountData({ ...accountData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) =>
                    setAccountData({ ...accountData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 bg-white"
                />
              </div>

              {!showPasswordForm && (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                >
                  + Change Password
                </button>
              )}

              {showPasswordForm && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) =>
                      setAccountData({
                        ...accountData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Enter new password (min 8 characters)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 font-semibold bg-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to keep current password
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  {savingAccount ? "Saving..." : "Save Account Settings"}
                </button>
                {showPasswordForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setAccountData({ ...accountData, password: "" });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Cycle Tracking Settings Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cycle Tracking Preferences
            </h2>
            <p className="text-gray-600 mb-6">
              Configure your cycle tracking preferences
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Average Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    name="cycle_length"
                    min="20"
                    max="40"
                    defaultValue={settings.cycle_length || 28}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Average Period Length (days)
                  </label>
                  <input
                    type="number"
                    name="period_length"
                    min="1"
                    max="10"
                    defaultValue={settings.period_length || 5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none transition text-gray-900 font-semibold bg-white"
                  />
                </div>
              </div>



              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition duration-200 text-center border-2 border-gray-300"
                >
                  Cancel
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
