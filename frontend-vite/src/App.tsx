import { useState, useEffect } from "react";
import "./styles/App.css"
import "./styles/modern-ui.css"
import "./styles/leaflet-dark.css"
import "./styles/sonner-toast.css"
import "./styles/dropdown-fix.css"
import Map from "./components/Map";
import BottomNavigation from "./components/BottomNavigation";
import ZonesScreen from "./screen/ZonesScreen";
import ProfileScreen from "./screen/ProfileScreen";
import LoginScreen from "./screen/LoginScreen";
import RegisterScreen from "./screen/RegisterScreen";
import { Toaster, toast } from "sonner";
import { useNotifications } from "./hooks/useNotifications";
import { setNotificationCallback } from "./utils/notifications";
import { useGeoData } from "./hooks/useGeoData";
import { useSettings } from "./hooks/useSettings";
import { useAuth } from "./hooks/useAuth";
import type { NotificationType } from "./hooks/useNotifications";
import type { TabId } from "./config/tabs";
import StatsScreen from "./screen/StatsScreen";
import "leaflet/dist/leaflet.css";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [focusArbolId, setFocusArbolId] = useState<string | null>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Hook de configuraciones para aplicar tema
  const { settings, loading: settingsLoading } = useSettings();

  // Cambiar el título del documento según la pestaña activa
  useEffect(() => {
    const titles: Record<TabId, string> = {
      map: "Cocoa App - Inicio",
      zones: "Cocoa App - Zonas",
      stats: "Cocoa App - Estadísticas",
      profile: "Cocoa App - Perfil",
    };
    document.title = titles[activeTab] || "Cocoa App";
  }, [activeTab]);

  const {
    notifications,
    unreadCount,
    addNotification,
    addLocalNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    setNotificationCallback(settings.notifications ? addNotification : () => {});
  }, [addNotification, settings.notifications]);

  // Resetear focusArbolId después de 2 segundos para permitir nuevos zooms
  useEffect(() => {
    if (focusArbolId) {
      const timer = setTimeout(() => {
        setFocusArbolId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusArbolId]);

  // Re-ejecutar useGeoData cuando cambien las configuraciones
  useEffect(() => {
    if (!settingsLoading) {
      // Las configuraciones se han cargado
    }
  }, [settingsLoading, settings.notifications]);

  const { geodata } = useGeoData((analysis) => {
    // No procesar notificaciones si las configuraciones aún se están cargando
    if (settingsLoading) {
      return;
    }
    
    // Procesar notificaciones del backend solo si están habilitadas
    if (analysis?.notifications && settings.notifications) {
      analysis.notifications.forEach((notif: any) => {
        createNotificationWithToast(
          notif.type,
          notif.title,
          notif.message,
          {
            duration: notif.duration || 6000,
            action: notif.action ? {
              label: notif.action.label,
              onClick: () => setActiveTab(notif.action.tab),
            } : undefined,
          }
        );
      });
    }
  }, !settingsLoading); // Solo fetch cuando las configuraciones estén cargadas

  const createNotificationWithToast = (
    type: NotificationType,
    title: string,
    message: string,
    toastOptions: any = {}
  ) => {
    // Solo crear notificaciones si están habilitadas
    if (!settings.notifications) {
      return null;
    }

    // Validar que los campos no sean undefined, null o NaN
    const validTitle = title || "Notificación";
    const validMessage = message || "Sin mensaje disponible";
    const validType = type || "info";
    
    // Agregar notificación local
    addLocalNotification({ type: validType, title: validTitle, message: validMessage });
    
    // Mostrar toast
    const toastFn = toast[validType];
    return toastFn(validMessage, toastOptions);
  };

  // Mostrar login/registro si no hay sesión
  if (authLoading) {
    return (
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100vh",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div 
        style={{ 
          height: "100vh",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          expand 
          theme={settings.theme}
          toastOptions={{
            style: {
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            },
          }}
        />
        {authView === "login" ? (
          <LoginScreen onSwitchToRegister={() => setAuthView("register")} />
        ) : (
          <RegisterScreen onSwitchToLogin={() => setAuthView("login")} />
        )}
      </div>
    );
  }

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
            focusArbolId={focusArbolId}
          />
        );
      case "zones":
        return <ZonesScreen onNavigateToMap={(arbolId: string) => {
          setFocusArbolId(arbolId);
          setActiveTab("map");
        }} />;
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
    <div 
      className="app" 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        transition: "all 0.3s ease"
      }}
    >
      <Toaster 
        position="top-center" 
        richColors 
        closeButton 
        expand 
        theme={settings.theme}
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          },
        }}
      />

      {/* Contenido principal ocupa todo el alto disponible */}
      <main style={{ 
        flex: 1, 
        overflow: "auto", 
        paddingBottom: "70px",
        backgroundColor: "var(--bg-primary)"
      }}>
        {renderContent()}
      </main>

      {/* Barra inferior fija */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
