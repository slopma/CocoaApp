import React from "react";
import { tabs, type TabId } from "../config/tabs";
import BottomNavItem from "./BottomNavItem";
import "../styles/notification-bell.css"; // estilos aparte
import "../styles/notification-footer.css";
import "../styles/notification-dropdown.css";

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

// BottomNavigation.tsx
const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="bottom-navigation"
      style={{
        display: "flex",
        flexDirection: "row", // fila horizontal
        justifyContent: "space-around",
        alignItems: "center",
        height: "60px",
        background: "var(--card-bg)",
        borderTop: "1px solid var(--border-color)",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
        borderRadius: "0",
        boxShadow: "var(--shadow)",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
      }}
    >
      {tabs.map((tab) => (
        <BottomNavItem
          key={tab.id}
          id={tab.id}
          icon={tab.icon}
          label={tab.label}
          active={tab.id === activeTab}
          onClick={onTabChange}
        />
      ))}
    </nav>
  );
};


export default BottomNavigation;
