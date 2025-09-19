import React from "react"
import ProfileHeader from "../components/profile/ProfileHeader"
import ProfileStats from "../components/profile/ProfileStats"
import ProfileMenu from "../components/profile/ProfileMenu"

const ProfileScreen: React.FC = () => {
  const stats = [
    { value: 2, label: "Fincas", color: "#007AFF" },
    { value: 205, label: "Frutos", color: "#4CAF50" },
    { value: 30, label: "Días Activo", color: "#FF9800" },
  ]

  const menuItems = [
    { icon: "⚙️", title: "Configuración", subtitle: "Ajustes de la aplicación" },
    { icon: "📊", title: "Reportes", subtitle: "Descargar reportes detallados" },
    { icon: "🔔", title: "Notificaciones", subtitle: "Gestionar alertas" },
    { icon: "❓", title: "Ayuda", subtitle: "Centro de soporte" },
    { icon: "🚪", title: "Cerrar Sesión", subtitle: "Salir de la aplicación" },
  ]

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: "90px",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#f5f5f5",
      }}
    >
      <ProfileHeader name="Juan Pérez" email="juan.perez@cocoapp.com" />
      <ProfileStats stats={stats} />
      <ProfileMenu items={menuItems} />
    </div>
  )
}

export default ProfileScreen
