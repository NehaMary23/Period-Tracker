/**
 * Authentication utility functions
 */

export interface User {
  id: number;
  username?: string;
  email: string;
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("token", token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
};

export const setUser = (user: User): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUser = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("user");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = async (): Promise<void> => {
  try {
    await fetch("https://period-tracker-s6yz.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear token and user from localStorage regardless of API response
    removeToken();
    removeUser();
  }
};
