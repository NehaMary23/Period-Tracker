/**
 * Notification utility - Simple preference management
 * No browser permission requests
 */

export const NotificationService = {
  /**
   * Check if browser supports notifications
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },
};
