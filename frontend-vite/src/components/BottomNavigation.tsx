import React from 'react'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'map', icon: '🏠', label: 'Inicio' },
    { id: 'zones', icon: '📍', label: 'Zonas' },
    { id: 'stats', icon: '📊', label: 'Estadísticas' },
    { id: 'profile', icon: '👤', label: 'Perfil' }
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      backgroundColor: 'white',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: activeTab === tab.id ? '#007AFF' : '#8E8E93',
            padding: '8px',
            transition: 'color 0.2s ease',
            minWidth: '60px'
          }}
        >
          <div style={{ fontSize: '24px' }}>{tab.icon}</div>
          <span style={{ fontSize: '10px', fontWeight: '500' }}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default BottomNavigation