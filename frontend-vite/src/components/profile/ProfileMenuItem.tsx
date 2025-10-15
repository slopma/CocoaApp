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
        padding: "20px 24px",
        borderBottom: "1px solid var(--border-color)",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
        e.currentTarget.style.transform = "translateX(4px)";
        e.currentTarget.style.borderLeft = "3px solid var(--accent-blue)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.borderLeft = "none";
      }}
      onClick={onClick}
    >
      <div style={{ 
        fontSize: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        backgroundColor: danger ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
        color: danger ? "var(--error)" : "var(--accent-blue)"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "17px",
            fontWeight: "700",
            color: danger ? "var(--error)" : "var(--text-primary)",
            marginBottom: "4px",
            letterSpacing: "-0.025em"
          }}
        >
          {title}
        </div>
        <div style={{ 
          fontSize: "14px", 
          color: "var(--text-secondary)",
          lineHeight: "1.4"
        }}>
          {subtitle}
        </div>
      </div>
      <div style={{ 
        fontSize: "20px", 
        color: "var(--text-muted)",
        fontWeight: "300",
        transition: "all 0.2s ease-in-out"
      }}>
        ›
      </div>
    </div>
  )
}

export default ProfileMenuItem
