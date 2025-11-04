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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "pointer",
        color: active ? "var(--accent-blue)" : "var(--text-muted)",
        padding: "10px 12px",
        flex: 1,
        minWidth: "70px",
        border: "none",
        borderRadius: "12px",
        backgroundColor: active ? "rgba(59, 130, 246, 0.1)" : "transparent",
        outline: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isPressed ? "scale(0.95)" : active ? "translateY(-2px)" : "none",
        position: "relative",
      }}
      onClick={() => onClick(id)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "rgba(142, 142, 147, 0.08)";
        }
      }}
      onMouseLeave={(e) => {
        setIsPressed(false);
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {/* Indicador superior para tab activo */}
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "32px",
            height: "3px",
            backgroundColor: "var(--accent-blue)",
            borderRadius: "0 0 3px 3px",
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
          }}
        />
      )}
      
      <img 
        src={icon} 
        alt={label}
        style={{ 
          width: "28px", 
          height: "28px",
          filter: active ? "none" : "grayscale(80%) opacity(0.6)",
          transition: "all 0.3s ease",
          transform: active ? "scale(1.1)" : "scale(1)",
        }} 
      />
      <span style={{ 
        fontSize: "11px", 
        fontWeight: active ? "600" : "500",
        letterSpacing: "0.2px",
        transition: "all 0.3s ease",
      }}>
        {label}
      </span>
    </button>
  );
};


export default BottomNavItem;
