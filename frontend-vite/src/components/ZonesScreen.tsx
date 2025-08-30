import React from 'react'

const ZonesScreen: React.FC = () => {
  const zones = [
    {
      id: 1,
      name: 'Finca 1',
      lastUpdate: 'hace 2 horas',
      status: 'active',
      maturation: 120,
      diseases: 5
    },
    {
      id: 2,
      name: 'Finca 2',
      lastUpdate: 'hace 1 día',
      status: 'inactive',
      maturation: 85,
      diseases: 2
    }
  ]

  const getStatusStyle = (status: string) => ({
    backgroundColor: status === 'active' ? '#E8F5E8' : '#FFF3E0',
    color: status === 'active' ? '#4CAF50' : '#FF9800',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  })

  return (
    <div style={{ 
      padding: '20px', 
      paddingBottom: '90px',
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: '#f5f5f5'
    }}>
      <h2 style={{ 
        marginBottom: '20px', 
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Mis Zonas
      </h2>
      
      {zones.map((zone) => (
        <div
          key={zone.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div>
              <h3 style={{ 
                margin: 0, 
                color: '#333', 
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {zone.name}
              </h3>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: '#666', 
                fontSize: '14px'
              }}>
                Última actualización: {zone.lastUpdate}
              </p>
            </div>
            <div style={getStatusStyle(zone.status)}>
              {zone.status === 'active' ? 'Activa' : 'Inactiva'}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#333',
                marginBottom: '4px'
              }}>
                {zone.maturation}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Maduración
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: zone.diseases > 3 ? '#F44336' : '#FF9800',
                marginBottom: '4px'
              }}>
                {zone.diseases}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Enfermedades
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ZonesScreen