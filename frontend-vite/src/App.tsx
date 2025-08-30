import { useState } from 'react'
import './App.css'
import Map from './components/Map'
import BottomNavigation from './components/BottomNavigation'
import ZonesScreen from './components/ZonesScreen'
import StatsScreen from './components/StatsScreen'
import ProfileScreen from './components/ProfileScreen'

function App() {
  const [activeTab, setActiveTab] = useState('map')

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <Map />
      case 'zones':
        return <ZonesScreen />
      case 'stats':
        return <StatsScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <Map />
    }
  }

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Mapa principal */}
      <div style={{ 
        height: '100%',
        paddingBottom: activeTab === 'map' ? '0' : '70px'
      }}>
        {renderContent()}
      </div>
      
      {/* barra inferior */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  )
}

export default App