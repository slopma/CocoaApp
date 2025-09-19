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
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#E0E0E0",
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
      <h2 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "24px", fontWeight: "bold" }}>
        {name}
      </h2>
      <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "16px" }}>{email}</p>
    </div>
  )
}

export default ProfileHeader
