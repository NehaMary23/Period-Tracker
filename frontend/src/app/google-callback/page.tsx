"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { googleCalendarAPI, AuthenticationError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      // Get the authorization code from URL params
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code) {
        setError("No authorization code received from Google");
        setLoading(false);
        return;
      }

      try {
        // Exchange code for tokens
        await googleCalendarAPI.callback(code);

        // Redirect back to settings page with success message
        router.push(
          "/settings?success=Google%20Calendar%20connected%20successfully",
        );
      } catch (err) {
        console.error("Failed to exchange code for tokens:", err);

        if (err instanceof AuthenticationError) {
          router.push("/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect Google Calendar",
        );
        setLoading(false);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-rose-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            Connecting to Google Calendar...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl font-semibold text-gray-900 mb-4">
            Connection Failed
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/settings")}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-rose-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Connecting to Google Calendar...
            </div>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
