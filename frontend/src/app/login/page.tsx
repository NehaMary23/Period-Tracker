"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { isAuthenticated, setToken, setUser } from "@/lib/auth";
import { authAPI } from "@/lib/api";

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

interface LoginResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    username?: string;
  };
}

// SVG Icon Components
const ChartIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const LightbulbIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01"
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const BellIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const SmartphoneIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const features = [
  {
    icon: ChartIcon,
    title: "Track Cycles",
    description:
      "Monitor your menstrual cycle patterns and predict future periods with accuracy",
  },
  {
    icon: LightbulbIcon,
    title: "Wellness Journal",
    description: "Reflect on your daily habits and track your overall wellbeing.",
  },
  {
    icon: TrendingUpIcon,
    title: "Health Insights",
    description:
      "Get personalized insights based on your cycle data and patterns",
  },
  {
    icon: BellIcon,
    title: "Cycle Predictions",
    description:
      "Accurately forecast your next period and fertile window using advanced algorithms.",
  },
  {
    icon: SmartphoneIcon,
    title: "Easy to Use",
    description:
      "Simple and intuitive interface designed for everyday tracking",
  },
  {
    icon: LockIcon,
    title: "Private & Secure",
    description: "Your health data is encrypted and kept completely private",
  },
];

export default function LoginPage() {
  // Input change handler
  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  // Validation functions
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    // Debug: log before API call
    console.log("[LOGIN] Submitting login for:", formData.email);

    // Add a timeout in case the API hangs
    const loginPromise = authAPI.login(formData.email, formData.password);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Request timed out after 10 seconds")),
        10000,
      ),
    );

    try {
      const data = (await Promise.race([
        loginPromise,
        timeoutPromise,
      ])) as LoginResponse;
      console.log("[LOGIN] API response:", data);

      if (!data.token) {
        setErrors({ form: "No token received from server" });
        return;
      }

      setToken(data.token);
      if (data.user) {
        setUser(data.user);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[LOGIN] Error:", err);
      let errorMessage = "Invalid email or password.";

      // Try to extract error from fetch response if available
      if (err && err.response && typeof err.response.json === "function") {
        try {
          const errorData = await err.response.json();
          if (errorData?.error) {
            const msg = errorData.error.toLowerCase();
            if (
              msg.includes("invalid email") ||
              msg.includes("invalid credentials") ||
              msg.includes("invalid password") ||
              msg.includes("not found")
            ) {
              errorMessage = "Invalid email or password.";
            } else {
              errorMessage = errorData.error;
            }
          }
        } catch {}
      }
      // If backend returns 401 or 400, always show invalid credentials
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        errorMessage = "Invalid email or password.";
      }
      // If error message contains invalid email or password or similar
      else if (
        err instanceof Error &&
        (err.message?.toLowerCase().includes("invalid email") ||
          err.message?.toLowerCase().includes("invalid credentials") ||
          err.message?.toLowerCase().includes("invalid password") ||
          err.message?.toLowerCase().includes("not found"))
      ) {
        errorMessage = "Invalid email or password.";
      } else if (
        typeof err === "string" &&
        (err.toLowerCase().includes("invalid email") ||
          err.toLowerCase().includes("invalid credentials") ||
          err.toLowerCase().includes("invalid password") ||
          err.toLowerCase().includes("not found"))
      ) {
        errorMessage = "Invalid email or password.";
      }
      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">PT</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  Period Tracker
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Health Tracking
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/signup"
                className="py-3 px-6 rounded-lg font-semibold transition duration-200 text-gray-700 hover:bg-gray-100 hover:text-rose-600"
              >
                Create Account
              </Link>
              <button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-sm hover:shadow-md">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Login Form */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-rose-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Take Control of Your Health
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
                Track your menstrual cycle with precision, understand your
                body's patterns, and make informed decisions about your health
                and wellness.
              </p>
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="text-rose-600 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span className="text-gray-700 font-medium">
                    100% Private
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-rose-600 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span className="text-gray-700 font-medium">Easy to Use</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-500 mb-8 font-light text-sm">
                Sign in to your account to continue tracking your health
              </p>

              {/* Form Errors */}
              {errors.form && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                    <span className="text-red-600 flex-shrink-0">
                      <AlertIcon />
                    </span>
                    {errors.form}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none text-black ${
                      errors.email
                        ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-600 text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={loading}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none pr-12 text-black ${
                        errors.password
                          ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-start -mt-2 mb-2">
                  <button
                    type="button"
                    className="text-sm text-rose-600 hover:text-rose-700 font-semibold transition duration-200 focus:outline-none cursor-pointer"
                    onClick={async () => {
                      if (!formData.email) {
                        setForgotMsg("Please enter your email address above.");
                        return;
                      }
                      setForgotMsg("");
                      try {
                        const res = await fetch(
                          "https://period-tracker-kkyh.onrender.com/api/auth/password-reset/",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: formData.email }),
                          },
                        );
                        if (res.ok) {
                          setForgotMsg(
                            `A mail has been sent to "${formData.email}" with instructions to reset your password.`,
                          );
                        } else {
                          const data = await res.json();
                          setForgotMsg(
                            data.error ||
                              "Failed to send reset email. Please try again.",
                          );
                        }
                      } catch (err) {
                        setForgotMsg(
                          "Failed to send reset email. Please try again.",
                        );
                      }
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                {forgotMsg && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2 mb-2 font-medium">
                    {forgotMsg}
                  </div>
                )}
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-rose-600 hover:text-rose-700 transition duration-200"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose Period Tracker?
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Everything you need to track, understand, and manage your
              menstrual health with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl hover:shadow-md hover:border-rose-100 transition duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 mb-5 text-rose-600">
                    <IconComponent />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-2 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p className="font-light">
              &copy; 2026 Period Tracker. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Link
                href="https://neha-portfolio-orcin.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition duration-200 font-light"
              >
                Neha Mary Pramod
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
