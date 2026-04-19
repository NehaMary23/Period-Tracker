/**
 * API Service Layer for Period Tracker Backend
 * Handles all communication with the Django backend
 */

import type { SignupResponse } from "@/types/auth";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://period-tracker-kkyh.onrender.com";

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Make authenticated API request to Django backend
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, headers, ...init } = options;

  // Build URL with query parameters
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Get token from sessionStorage if available
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  console.log("API Request Debug:", {
    endpoint,
    url,
    hasToken: !!token,
    token: token ? token.substring(0, 20) + "..." : null,
  });

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  console.log("Request Headers:", {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token.substring(0, 20)}...` : "Not set",
  });

  const response = await fetch(url, {
    ...init,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));

    console.error("API Error:", {
      status: response.status,
      error: error.message,
      endpoint,
    });

    // If unauthorized, throw authentication error
    if (response.status === 401) {
      console.warn("Authentication failed - invalid or expired token");
      if (typeof window !== "undefined") {
        // Clear invalid token
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
      throw new AuthenticationError(error.message || "Authentication failed");
    }

    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Authentication API calls
 */
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: Record<string, unknown> }>(
      "/api/auth/login/",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    ),

  signup: (email: string, password: string, username: string) =>
    apiRequest<SignupResponse>("/api/auth/signup/", {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    }),

  logout: () =>
    apiRequest("/api/auth/logout/", {
      method: "POST",
    }),

  me: () => apiRequest<Record<string, unknown>>("/api/auth/me/"),
};

/**
 * Period tracking API calls
 */
export const periodAPI = {
  list: () => apiRequest<Array<Record<string, unknown>>>("/api/periods/"),
  create: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/periods/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get: (id: string | number) =>
    apiRequest<Record<string, unknown>>(`/api/periods/${id}/`),
  update: (id: string | number, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/api/periods/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    apiRequest(`/api/periods/${id}/`, { method: "DELETE" }),
};
/**
 * Symptom tracking API calls
 */
export const symptomAPI = {
  list: (periodId: string | number) =>
    apiRequest<Array<Record<string, unknown>>>(
      `/periods/${periodId}/symptoms/`,
    ),

  create: (periodId: string | number, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/periods/${periodId}/symptoms/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    periodId: string | number,
    symptomId: string | number,
    data: Record<string, unknown>,
  ) =>
    apiRequest<Record<string, unknown>>(
      `/periods/${periodId}/symptoms/${symptomId}/`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    ),

  delete: (periodId: string | number, symptomId: string | number) =>
    apiRequest(`/periods/${periodId}/symptoms/${symptomId}/`, {
      method: "DELETE",
    }),
};

/**
 * Cycle statistics API calls
 */
export const statsAPI = {
  getCycleInfo: () =>
    apiRequest<Record<string, unknown>>("/api/stats/cycle-info/"),
  getPrediction: () =>
    apiRequest<Record<string, unknown>>("/api/stats/prediction/"),
  getHistory: () => apiRequest<Record<string, unknown>>("/api/stats/history/"),
};
/**
 * Settings API calls
 */
export const settingsAPI = {
  get: () => apiRequest<Record<string, unknown>>("/api/settings/"),
  update: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/settings/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/**
 * Google Calendar API calls
 */
export const googleCalendarAPI = {
  getAuthUrl: () =>
    apiRequest<{ auth_url: string; state: string }>(
      "/api/google-calendar/auth-url/",
      { method: "GET" },
    ),

  callback: (code: string) =>
    apiRequest<{ success: boolean; message: string }>(
      "/api/google-calendar/callback/",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
    ),

  getStatus: () =>
    apiRequest<{ connected: boolean; token_expiry?: string }>(
      "/api/google-calendar/status/",
      { method: "GET" },
    ),

  disconnect: () =>
    apiRequest<{ success: boolean; message: string }>(
      "/api/google-calendar/disconnect/",
      { method: "POST" },
    ),
};
