import React from "react";
import { tabs, type TabId } from "../config/tabs";
import BottomNavItem from "./BottomNavItem";
import "./BottomNavigation.css"; // estilos aparte

interface BottomNavigationProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="bottom-navigation">
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
