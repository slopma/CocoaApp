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
               backgroundColor: "var(--card-bg)",
               borderRadius: "20px",
               padding: "24px",
               marginBottom: "24px",
               boxShadow: "var(--shadow-lg)",
               border: "2px solid var(--border-color)",
             }}
    >
      <h3 style={{ 
        margin: "0 0 20px 0", 
        color: "var(--text-primary)", 
        fontSize: "20px", 
        fontWeight: "700",
        letterSpacing: "-0.025em"
      }}>
        Mi Actividad
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: "16px",
          textAlign: "center",
        }}
      >
        {stats.map((s, i) => (
          <div key={i} style={{ 
            flex: 1, 
            minWidth: 0,
            textAlign: "center",
            padding: "12px 8px",
            borderRadius: "12px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ 
              fontSize: "24px", 
              fontWeight: "800", 
              color: s.color,
              marginBottom: "4px"
            }}>
              {s.value}
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "var(--text-secondary)", 
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileStats
