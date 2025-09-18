declare module "./DraggableNotificationBell" {
  import { ComponentType } from "react";

  interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read?: boolean;
  }

  interface Props {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDelete: (id: string) => void;
  }

  const DraggableNotificationBell: ComponentType<Props>;
  export default DraggableNotificationBell;
}
