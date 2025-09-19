import React from "react"

interface ProfileMenuItemProps {
  icon: string
  title: string
  subtitle: string
  danger?: boolean
  onClick?: () => void
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, title, subtitle, danger, onClick }) => {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #f0f0f0",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      onClick={onClick}
    >
      <div style={{ fontSize: "24px" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "500",
            color: danger ? "#F44336" : "#333",
            marginBottom: "2px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: "16px", color: "#ccc" }}>›</div>
    </div>
  )
}

export default ProfileMenuItem
