import React from "react"
import ProfileMenuItem from "./ProfileMenuItem"

interface MenuItem {
  icon: string
  title: string
  subtitle: string
  action?: () => void
}

interface ProfileMenuProps {
  items: MenuItem[]
  onSettingsClick?: () => void
  onReportsClick?: () => void
  onHelpClick?: () => void
  onLogoutClick?: () => void
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  items, 
  onSettingsClick,
  onReportsClick,
  onHelpClick,
  onLogoutClick
}) => {
  const handleItemClick = (title: string) => {
    switch (title) {
      case "Configuración":
        onSettingsClick?.();
        break;
      case "Reportes":
        onReportsClick?.();
        break;
      case "Ayuda":
        onHelpClick?.();
        break;
      case "Cerrar Sesión":
        onLogoutClick?.();
        break;
      default:
        console.log(`Clicked on: ${title}`);
    }
  };

  return (
    <div
           style={{
             backgroundColor: "var(--card-bg)",
             borderRadius: "20px",
             boxShadow: "var(--shadow-lg)",
             border: "2px solid var(--border-color)",
             overflow: "hidden",
           }}
    >
      {items.map((item, index) => (
        <ProfileMenuItem
          key={index}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          danger={item.title === "Cerrar Sesión"}
          onClick={() => handleItemClick(item.title)}
        />
      ))}
    </div>
  )
}

export default ProfileMenu
