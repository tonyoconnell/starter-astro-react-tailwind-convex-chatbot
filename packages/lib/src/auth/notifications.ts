import { atom } from "nanostores";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

// Notification store
export const $notifications = atom<Notification[]>([]);

// Notification actions
export const notificationActions = {
  /**
   * Add a new notification
   */
  add(notification: Omit<Notification, "id">) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    $notifications.set([...$notifications.get(), newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        notificationActions.remove(id);
      }, newNotification.duration);
    }

    return id;
  },

  /**
   * Remove a notification by ID
   */
  remove(id: string) {
    $notifications.set($notifications.get().filter(n => n.id !== id));
  },

  /**
   * Clear all notifications
   */
  clear() {
    $notifications.set([]);
  },

  /**
   * Add success notification
   */
  success(title: string, message: string, duration?: number) {
    return notificationActions.add({
      type: "success",
      title,
      message,
      duration,
    });
  },

  /**
   * Add error notification
   */
  error(title: string, message: string, duration?: number) {
    return notificationActions.add({
      type: "error",
      title,
      message,
      duration: duration ?? 8000, // Errors show longer by default
    });
  },

  /**
   * Add warning notification
   */
  warning(title: string, message: string, duration?: number) {
    return notificationActions.add({
      type: "warning",
      title,
      message,
      duration,
    });
  },

  /**
   * Add info notification
   */
  info(title: string, message: string, duration?: number) {
    return notificationActions.add({
      type: "info",
      title,
      message,
      duration,
    });
  },
};