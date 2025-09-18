import IconDropdown from "../assets/Dropdown.png";
import IconExpand from "../assets/Expand.png";
import { useState } from "react";

export const Legend = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "80px",
        left: "10px",
        background: "rgba(255, 255, 255, 0.95)",
        padding: collapsed ? "12px" : "16px",
        borderRadius: "12px",
        fontSize: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        zIndex: 1000,
        border: "1px solid rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
        transition: "all 180ms ease-in-out",
        width: collapsed ? "140px" : "240px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: collapsed ? 0 : "12px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#2C3E50",
            fontSize: collapsed ? "11px" : "13px",
          }}
        >
          Estados del Cacao:
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir leyenda" : "Colapsar leyenda"}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <img
            src={collapsed ? IconExpand : IconDropdown}
            alt={collapsed ? "Expandir" : "Colapsar"}
            style={{ width: 14, height: 14 }}
          />
        </button>
      </div>

      {!collapsed && (
        <div style={{ paddingTop: "4px" }}>
          <div style={{ color: "#10259f", fontWeight: 600 }}>🟦 Inmaduro</div>
          <div style={{ color: "#9f9a10", fontWeight: 600 }}>🟨 Transición</div>
          <div style={{ color: "#259f10", fontWeight: 600 }}>🟩 Maduro</div>
          <div style={{ color: "#9f1028", fontWeight: 600 }}>🟥 Enfermo</div>
        </div>
      )}
    </div>
  );
};
