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
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <button
      className="bottom-nav-item"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        cursor: "pointer",
        color: active ? "#007AFF" : "#6B7280",
        padding: "8px 16px",
        flex: 1,
        minWidth: "70px",
        border: "none",
        borderRadius: "0",
        backgroundColor: active ? "rgba(0, 122, 255, 0.05)" : "transparent",
        outline: "none",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isPressed ? "scale(0.96)" : "scale(1)",
        position: "relative",
        boxShadow: active 
          ? "0 2px 8px rgba(0, 122, 255, 0.15), 0 1px 3px rgba(0, 122, 255, 0.1)" 
          : "none",
      }}
      onClick={() => onClick(id)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Indicador superior para tab activo */}
      {active && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40px",
            height: "2.5px",
            backgroundColor: "#007AFF",
            borderRadius: "0 0 2px 2px",
            boxShadow: "0 2px 8px rgba(0, 122, 255, 0.35)",
          }}
        />
      )}
      
      {/* Icono */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          transition: "all 0.25s ease",
        }}
      >
        <img 
          src={icon} 
          alt={label}
          style={{ 
            width: "24px", 
            height: "24px",
            filter: active 
              ? "brightness(1.05) saturate(1.2)" 
              : "grayscale(50%) opacity(0.65)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }} 
        />
      </div>
      
      {/* Label */}
      <span 
        style={{ 
          fontSize: "10px", 
          fontWeight: active ? "600" : "500",
          letterSpacing: "0.2px",
          transition: "all 0.25s ease",
          opacity: active ? 1 : 0.75,
        }}
      >
        {label}
      </span>
    </button>
  );
};


export default BottomNavItem;