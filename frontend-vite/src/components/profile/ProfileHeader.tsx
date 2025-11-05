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
        padding: "24px",
        marginBottom: "20px",
        boxShadow: "var(--shadow-lg)",
        border: "2px solid var(--border-color)",
        textAlign: "center",
      }}
    >
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
          border: onAvatarClick ? "3px solid var(--accent-blue)" : "2px solid var(--border-color)",
          position: "relative",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (onAvatarClick) {
            e.currentTarget.style.transform = "scale(1.05)";
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
              backgroundColor: "rgba(0, 122, 255, 0.8)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
              opacity: 0,
              transition: "opacity 0.2s ease",
              cursor: "pointer",
            }}
          >
            📷
          </div>
        )}
      </div>
      {onAvatarClick && (
        <p
          style={{
            margin: "0 0 16px 0",
            color: "var(--accent-blue)",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={onAvatarClick}
        >
          Cambiar foto de perfil
        </p>
      )}
      {avatar && onDeleteAvatar && (
        <button
          onClick={onDeleteAvatar}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            textDecoration: 'underline',
            padding: '0',
            margin: '0 0 16px 8px',
          }}
        >
          Eliminar foto
        </button>
      )}
      <h2 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "24px", fontWeight: "bold" }}>
        {name}
      </h2>
      <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: "16px" }}>{email}</p>
    </div>
  )
}

export default ProfileHeader
