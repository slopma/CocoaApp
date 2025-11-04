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
        console.log("🔔 Fetching notifications from:", `${import.meta.env.VITE_API_URL}/notifications/`);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("🔔 Notifications received:", data);
        console.log("🔔 Unread count from backend:", data.filter((n: any) => !n.read).length);
        setNotifications((prev) => {
          // Mantener notificaciones locales y agregar las del backend
          const localNotifications = prev.filter(n => n.id.startsWith("local_"));
          const backendNotifications = data || [];
          const combined = [...localNotifications, ...backendNotifications];
          console.log("🔔 Combined notifications (local + backend):", combined);
          return combined;
        });
      } catch (err: any) {
        console.error("🔔 Error fetching notifications:", err);
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

    const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const newNotif = await res.json();
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const addLocalNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const localNotif: Notification = {
      ...notification,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    console.log("🔔 Adding local notification:", localNotif);
    setNotifications((prev) => {
      const newNotifications = [localNotif, ...prev];
      console.log("🔔 Updated notifications list:", newNotifications);
      return newNotifications;
    });
    return localNotif;
  };

  const markAsRead = async (id: string) => {
    console.log("🔔 Marking notification as read:", id);
    
    // Solo llamar al backend si no es una notificación local
    if (!id.startsWith("local_")) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read/`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      console.log("🔔 Updated notifications after mark as read:", updated);
      return updated;
    });
  };

  const markAllAsRead = async () => {
    console.log("🔔 Marking all notifications as read");
    
    // Guardar estado original por si necesitamos revertir
    const originalNotifications = [...notifications];
    
    try {
      // Marcar todas como leídas localmente primero (optimistic update)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      
      // Intentar marcar las notificaciones del backend
      const backendNotifications = notifications.filter(n => !n.id.startsWith("local_"));
      
      if (backendNotifications.length > 0) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-all-read/`, {
          method: "PUT",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      }
      
      console.log("🔔 All notifications marked as read successfully");
    } catch (err: any) {
      console.error("🔔 Error marking all as read:", err);
      // Revertir a estado original si falla
      setNotifications(originalNotifications);
    }
  };

  const deleteNotification = async (id: string) => {
    console.log("🔔 Deleting notification:", id);
    
    // Solo llamar al backend si no es una notificación local
    if (!id.startsWith("local_")) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
    
    setNotifications((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      console.log("🔔 Updated notifications after delete:", filtered);
      return filtered;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    addNotification,
    addLocalNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};