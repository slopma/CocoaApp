import React from "react"

interface StatItem {
  value: number | string
  label: string
  color: string
}

interface ProfileStatsProps {
  stats: StatItem[]
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "18px", fontWeight: "600" }}>
        Mi Actividad
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          textAlign: "center",
        }}
      >
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileStats
