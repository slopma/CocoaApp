import { useState, useRef } from "react";
import NotificationBell from "./NotificationBell";

interface Notification {
  id: string;
  type: "error" | "warning" | "success" | "info" | string;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

interface DraggableNotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const DraggableNotificationBell: React.FC<DraggableNotificationBellProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const [position, setPosition] = useState<{ top: number; right: number }>(() => {
    const saved = localStorage.getItem("bell-position");
    return saved ? JSON.parse(saved) : { top: 80, right: 20 };
  });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPosition({
      top: e.clientY - offset.current.y,
      right: window.innerWidth - e.clientX - 40 + offset.current.x,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    localStorage.setItem("bell-position", JSON.stringify(position));
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        right: position.right,
        zIndex: 2000,
        cursor: "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <NotificationBell
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDelete={onDelete}
      />
    </div>
  );
};

export default DraggableNotificationBell;
