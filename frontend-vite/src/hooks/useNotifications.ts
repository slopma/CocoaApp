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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/notifications");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const addNotification = async (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const body = {
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const res = await fetch("http://localhost:8000/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const newNotif = await res.json();
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const markAsRead = async (id: string) => {
    await fetch(`http://localhost:8000/notifications/${id}/read`, {
      method: "PUT",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = async (id: string) => {
    await fetch(`http://localhost:8000/notifications/${id}`, {
      method: "DELETE",
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    loading,
    error,
    addNotification,
    markAsRead,
    deleteNotification,
  };
};
