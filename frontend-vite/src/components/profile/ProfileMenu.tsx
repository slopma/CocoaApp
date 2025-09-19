import React from "react"
import ProfileMenuItem from "./ProfileMenuItem"

interface MenuItem {
  icon: string
  title: string
  subtitle: string
}

interface ProfileMenuProps {
  items: MenuItem[]
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ items }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
        />
      ))}
    </div>
  )
}

export default ProfileMenu
