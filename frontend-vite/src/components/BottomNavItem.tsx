import React from "react";
import type { TabId } from "../config/tabs";

interface BottomNavItemProps {
  id: TabId;
  icon: string; // Ahora será una URL de imagen
  label: string;
  active: boolean;
  onClick: (id: TabId) => void;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  id,
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        cursor: "pointer",
        color: active ? "#007AFF" : "#8E8E93",
        padding: "8px",
        flex: 1,
        minWidth: "60px",
        border: "none",
        borderRadius: "0",
        backgroundColor: "transparent",
        outline: "none",
      }}
      onClick={() => onClick(id)}  // ✅ Aquí se llama al callback con el id del tab
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
      onFocus={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.outline = "none";
      }}
    >
      <img 
        src={icon} 
        alt={label}
        style={{ 
          width: "24px", 
          height: "24px",
          filter: active ? "none" : "grayscale(100%) opacity(0.5)",
          transition: "filter 0.2s ease"
        }} 
      />
      <span style={{ fontSize: "10px", fontWeight: "500" }}>{label}</span>
    </button>
  );
};


export default BottomNavItem;
