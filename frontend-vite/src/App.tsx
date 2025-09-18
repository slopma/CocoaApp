import { useState, useEffect } from "react";
import "./App.css";
import Map from "./components/Map";
import BottomNavigation from "./components/BottomNavigation";
import ZonesScreen from "./components/ZonesScreen";
import StatsScreen from "./components/StatsScreen";
import ProfileScreen from "./components/ProfileScreen";
import { Toaster, toast } from "sonner";
import { useNotifications } from "./hooks/useNotifications";
import { setNotificationCallback } from "./utils/notifications";
import { useGeoData } from "./hooks/useGeoData";
import { analyzeZones } from "./utils/zoneAnalizer";



function App() {
  const [activeTab, setActiveTab] = useState("map");

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Pasamos addNotification a notifications.ts
  useEffect(() => {
    setNotificationCallback(addNotification);
  }, [addNotification]);

  // Hook para cargar geodata y analizarlo
  const geodata = useGeoData((geojson) => {
    analyzeZones(geojson, createNotificationWithToast, setActiveTab);
  });

  const createNotificationWithToast = (
    type: "error" | "warning" | "info" | "success",
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
        return <ZonesScreen geodata={geodata} />;
      case "stats":
        return <StatsScreen geodata={geodata} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <Map geodata={geodata} />;
    }
  };

  return (
    <div className="app">
      <Toaster position="top-center" richColors closeButton expand />
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
        
      </div>

      <main className="main-content" style={{ paddingBottom: "80px" }}>
        {renderContent()}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
