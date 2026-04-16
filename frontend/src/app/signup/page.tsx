"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { isAuthenticated, setToken, setUser } from "@/lib/auth";
import { authAPI } from "@/lib/api";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  form?: string;
}

import type { SignupResponse } from "@/types/auth";

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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "Please confirm your password";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail]);

  const handleInputChange = (
    field: "username" | "email" | "password" | "passwordConfirm",
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const data: SignupResponse = await authAPI.signup(
        formData.email,
        formData.password,
        formData.username
      );

      if (!data.token) {
        setErrors({ form: "No token received from server" });
        return;
      }

      setToken(data.token);
      if (data.user) {
        setUser(data.user);
      }
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
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
                href="/login"
                className="py-3 px-6 rounded-lg font-semibold transition duration-200 text-gray-700 hover:bg-gray-100 hover:text-rose-600"
              >
                Sign In
              </Link>
              <button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-sm hover:shadow-md">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Signup Form */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-rose-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Start Your Health Journey
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
                Create your account and join thousands of people taking control
                of their menstrual health with our easy-to-use tracking app.
              </p>
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="text-rose-600 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Free Forever
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-rose-600 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Fully Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit border border-gray-100 mt-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                Create Account
              </h2>
              <p className="text-gray-500 mb-8 font-light text-sm">
                Join us and start tracking your health today
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
                {/* Username Field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700 mb-2.5"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    disabled={loading}
                    placeholder="Choose a username"
                    className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none text-black ${
                      errors.username
                        ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-invalid={!!errors.username}
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
                  />
                  {errors.username && (
                    <p
                      id="username-error"
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.username}
                    </p>
                  )}
                </div>

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
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-semibold text-gray-700 mb-2.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      value={formData.passwordConfirm}
                      onChange={(e) =>
                        handleInputChange("passwordConfirm", e.target.value)
                      }
                      disabled={loading}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg transition focus:outline-none pr-12 text-black ${
                        errors.passwordConfirm
                          ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-invalid={!!errors.passwordConfirm}
                      aria-describedby={
                        errors.passwordConfirm
                          ? "passwordConfirm-error"
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      aria-label={
                        showPasswordConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showPasswordConfirm ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.passwordConfirm && (
                    <p
                      id="passwordConfirm-error"
                      className="text-red-600 text-sm mt-1"
                    >
                      {errors.passwordConfirm}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-rose-600 hover:text-rose-700 transition duration-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
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
