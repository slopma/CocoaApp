import React, { useState, useRef } from "react"
import ProfileHeader from "../components/profile/ProfileHeader"
import ProfileStats from "../components/profile/ProfileStats"
import ProfileMenu from "../components/profile/ProfileMenu"
import SettingsScreen from "./SettingsScreen"
import { useProfileStats } from "../hooks/useProfileStats"
import { useAuth } from "../hooks/useAuth"
import { useAvatar } from "../hooks/useAvatar"
import { toast } from "sonner"
const ajustesIcon = "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/app-icons/ajustes.png";

const ProfileScreen: React.FC = () => {
  const { stats, loading, error } = useProfileStats()
  const { authUser, signOut, refreshUser } = useAuth()
  const { uploadAvatar, deleteAvatar, uploading } = useAvatar()
  const [currentView, setCurrentView] = useState<'profile' | 'settings'>('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const statsData = [
    { value: stats.fincas, label: "Fincas", color: "#007AFF" },
    { value: stats.frutos, label: "Frutos", color: "#4CAF50" },
    { value: stats.zonas, label: "Zonas", color: "#9C27B0" },
    { value: stats.arboles, label: "Árboles", color: "#FF5722" },
  ]

  const menuItems = [
    { icon: ajustesIcon, title: "Configuración", subtitle: "Ajustes de la aplicación" },
    { icon: "📊", title: "Reportes", subtitle: "Descargar reportes detallados" },
    { icon: "❓", title: "Ayuda", subtitle: "Centro de soporte" },
    { icon: "🚪", title: "Cerrar Sesión", subtitle: "Salir de la aplicación" },
  ]

  const handleSettingsClick = () => {
    setCurrentView('settings')
  }

  const handleBackToProfile = () => {
    setCurrentView('profile')
  }

  const handleReportsClick = () => {
    console.log('📊 Reports clicked')
    // TODO: Implementar pantalla de reportes
  }


  const handleHelpClick = () => {
    console.log('❓ Help clicked')
    // TODO: Implementar pantalla de ayuda
  }

  const handleLogoutClick = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        toast.error(error.message || "Error al cerrar sesión")
      } else {
        toast.success("Sesión cerrada exitosamente")
      }
    } catch (err) {
      toast.error("Error al cerrar sesión")
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUser?.id) {
      return
    }

    const avatarUrl = await uploadAvatar(authUser.id, file)
    
    // Resetear el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // Actualizar el avatar localmente si se subió exitosamente
    if (avatarUrl) {
      // Refrescar el usuario para obtener el avatar actualizado
      await refreshUser()
    }
  }

  if (currentView === 'settings') {
    return (
      <div>
        <div
        style={{
          padding: "20px",
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
        }}
        >
          <button
            onClick={handleBackToProfile}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              backgroundColor: "var(--accent-blue)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              color: "white",
              transition: "all 0.2s ease-in-out",
              boxShadow: "var(--shadow)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-blue-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-blue)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
          >
            ← Volver al Perfil
          </button>
        </div>
        <SettingsScreen />
      </div>
    )
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          paddingBottom: "90px",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Cargando estadísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          paddingBottom: "90px",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <p style={{ color: "#ef4444", fontSize: "16px" }}>Error al cargar estadísticas: {error}</p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: "90px",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={uploading}
      />
      <ProfileHeader 
        name={authUser?.name || "Usuario"} 
        email={authUser?.email || ""} 
        avatar={authUser?.avatar}
        onAvatarClick={handleAvatarClick}
      />
      {uploading && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          Subiendo imagen...
        </div>
      )}
      <ProfileStats stats={statsData} />
      <ProfileMenu 
        items={menuItems}
        onSettingsClick={handleSettingsClick}
        onReportsClick={handleReportsClick}
        onHelpClick={handleHelpClick}
        onLogoutClick={handleLogoutClick}
      />
    </div>
  )
}

export default ProfileScreen
