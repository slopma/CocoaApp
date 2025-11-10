import React from "react"

interface ProfileHeaderProps {
  name: string
  email: string
  avatar?: string
  onAvatarClick?: () => void
  onDeleteAvatar?: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email, avatar, onAvatarClick, onDeleteAvatar }) => {
  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "20px",
        padding: "0",
        marginBottom: "20px",
        boxShadow: "var(--shadow-lg)",
        border: "2px solid var(--border-color)",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Banner superior de color sólido */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%)",
          height: "100px",
          width: "100%",
        }}
      />
      
      {/* Contenido del perfil */}
      <div style={{ padding: "0 24px 28px 24px", marginTop: "-50px", position: "relative" }}>
      <div
        onClick={onAvatarClick}
        style={{
          width: "120px",
          height: "120px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "50%",
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "48px",
          cursor: onAvatarClick ? "pointer" : "default",
          overflow: "hidden",
          border: onAvatarClick ? "4px solid var(--accent-blue)" : "2px solid var(--border-color)",
          position: "relative",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          if (onAvatarClick) {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.25)";
            e.currentTarget.style.borderColor = "var(--accent-blue-hover)";
            const overlay = e.currentTarget.querySelector(".avatar-overlay") as HTMLElement;
            if (overlay) {
              overlay.style.opacity = "1";
            }
          }
        }}
        onMouseLeave={(e) => {
          if (onAvatarClick) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.borderColor = "var(--accent-blue)";
            const overlay = e.currentTarget.querySelector(".avatar-overlay") as HTMLElement;
            if (overlay) {
              overlay.style.opacity = "0";
            }
          }
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          <span>👤</span>
        )}
        {onAvatarClick && (
          <div
            className="avatar-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.92) 0%, rgba(37, 99, 235, 0.92) 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              color: "white",
              opacity: 0,
              transition: "opacity 0.3s ease",
              cursor: "pointer",
            }}
          >
            📷
          </div>
        )}
      </div>
      
      {onAvatarClick && (
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          justifyContent: "center", 
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <p
            style={{
              margin: "0",
              color: "var(--accent-blue)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            onClick={onAvatarClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent-blue-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--accent-blue)";
            }}
          >
            Cambiar foto
          </p>
          {avatar && onDeleteAvatar && (
            <>
              <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>•</span>
              <p
                style={{
                  margin: "0",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onClick={onDeleteAvatar}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#ef4444";
                }}
              >
                Eliminar foto
              </p>
            </>
          )}
        </div>
      )}
      
      <h2 style={{ 
        margin: "0 0 8px 0", 
        color: "var(--text-primary)", 
        fontSize: "24px", 
        fontWeight: "700",
        letterSpacing: "-0.3px"
      }}>
        {name}
      </h2>
      <p style={{ 
        margin: "0", 
        color: "var(--text-secondary)", 
        fontSize: "15px",
        fontWeight: "500"
      }}>
        {email}
      </p>
      </div>
    </div>
  )
}

export default ProfileHeader