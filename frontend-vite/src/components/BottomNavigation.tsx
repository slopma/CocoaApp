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
        justifyContent: "space-evenly",
        alignItems: "stretch",
        height: "65px",
        background: "linear-gradient(180deg, var(--card-bg) 0%, rgba(var(--card-bg-rgb, 255, 255, 255), 0.98) 100%)",
        borderTop: "1px solid rgba(var(--border-color-rgb, 200, 200, 200), 0.3)",
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.04), 0 -1px 3px rgba(0, 0, 0, 0.02)",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
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
          {/* Separador vertical entre tabs */}
          {index < tabs.length - 1 && (
            <div
              style={{
                width: "1px",
                height: "40px",
                alignSelf: "center",
                background: "linear-gradient(to bottom, transparent 0%, rgba(var(--border-color-rgb, 200, 200, 200), 0.2) 50%, transparent 100%)",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};


export default BottomNavigation;