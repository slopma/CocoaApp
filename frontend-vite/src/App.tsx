import { useState, useEffect } from "react";
import "./styles/App.css"
import Map from "./components/Map";
import BottomNavigation from "./components/BottomNavigation";
import ZonesScreen from "./screen/ZonesScreen";
import ProfileScreen from "./screen/ProfileScreen";
import { Toaster, toast } from "sonner";
import { useNotifications } from "./hooks/useNotifications";
import { setNotificationCallback } from "./utils/notifications";
import { useGeoData } from "./hooks/useGeoData";
import { analyzeZones } from "./utils/zoneAnalizer";
import type { NotificationType } from "./hooks/useNotifications";
import type { TabId } from "C:\Users\luisa\Documents\P2_CocoaApp_\backend\config\tabs.ts";
import StatsScreen from "./screen/StatsScreen";
import "leaflet/dist/leaflet.css";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("map");

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    setNotificationCallback(addNotification);
  }, [addNotification]);

  const { geodata } = useGeoData((geojson) => {
    analyzeZones(geojson, createNotificationWithToast, setActiveTab);
  });

  const createNotificationWithToast = (
    type: NotificationType,
    title: string,
    message: string,
    toastOptions: any = {}
  ) => {
    addNotification({ type, title, message });
    const toastFn = toast[type];
    return toastFn(message, toastOptions);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "map":
        return (
          <Map
            geodata={geodata}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
        );
      case "zones":
        return <ZonesScreen />;
      case "stats":
        return <StatsScreen geodata={geodata} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return (
          <Map
            geodata={geodata}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
        );
    }
  };

  return (
    <div className="app" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Toaster position="top-center" richColors closeButton expand />

      {/* Contenido principal ocupa todo el alto disponible */}
      <main style={{ flex: 1, overflow: "auto", paddingBottom: "60px" }}>
        {renderContent()}
      </main>

      {/* Barra inferior fija */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
