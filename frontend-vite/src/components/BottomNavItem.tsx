import React from "react";
import type { TabId } from "../config/tabs";

interface BottomNavItemProps {
  id: TabId;
  icon: string;
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
      onClick={() => onClick(id)}
      style={{
        background: "none",
        border: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
        color: active ? "#007AFF" : "#8E8E93",
        padding: "8px",
        transition: "color 0.2s ease",
        minWidth: "60px",
      }}
    >
      <div style={{ fontSize: "24px" }}>{icon}</div>
      <span style={{ fontSize: "10px", fontWeight: "500" }}>{label}</span>
    </button>
  );
};

export default BottomNavItem;
