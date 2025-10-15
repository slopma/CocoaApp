import React from "react"

interface ProfileHeaderProps {
  name: string
  email: string
  avatar?: string
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email, avatar }) => {
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
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "50%",
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
        }}
      >
        {avatar || "👤"}
      </div>
      <h2 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "24px", fontWeight: "bold" }}>
        {name}
      </h2>
      <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: "16px" }}>{email}</p>
    </div>
  )
}

export default ProfileHeader
