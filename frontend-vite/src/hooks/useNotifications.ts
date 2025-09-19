import { useState, useEffect } from "react";

export type NotificationType = "error" | "warning" | "info" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("finca-notifications");
    if (saved) {
      const parsedNotifications: Notification[] = JSON.parse(saved);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n) => !n.read).length);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("finca-notifications", JSON.stringify(notifications));
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random()}`, // string id
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};
