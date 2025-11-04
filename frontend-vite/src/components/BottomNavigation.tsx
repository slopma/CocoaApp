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
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: "70px",
        background: "var(--card-bg)",
        borderTop: "2px solid var(--border-color)",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
        borderRadius: "0",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(var(--card-bg-rgb), 0.95)",
      }}
    >
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <BottomNavItem
            id={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={tab.id === activeTab}
            onClick={onTabChange}
          />
          {/* Separador vertical entre pestañas */}
          {index < tabs.length - 1 && (
            <div
              style={{
                width: "2px",
                height: "40px",
                background: "linear-gradient(to bottom, transparent, var(--border-color), transparent)",
                opacity: 0.6,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};


export default BottomNavigation;
