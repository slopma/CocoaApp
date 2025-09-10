import React from 'react'

const ProfileScreen: React.FC = () => {
  const menuItems = [
    { icon: '⚙️', title: 'Configuración', subtitle: 'Ajustes de la aplicación' },
    { icon: '📊', title: 'Reportes', subtitle: 'Descargar reportes detallados' },
    { icon: '🔔', title: 'Notificaciones', subtitle: 'Gestionar alertas' },
    { icon: '❓', title: 'Ayuda', subtitle: 'Centro de soporte' },
    { icon: '🚪', title: 'Cerrar Sesión', subtitle: 'Salir de la aplicación' }
  ]

  return (
    <div style={{ 
      padding: '20px', 
      paddingBottom: '90px',
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header del perfil */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#E0E0E0', 
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          👤
        </div>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#333',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Juan Pérez
        </h2>
        <p style={{ 
          margin: '0 0 16px 0', 
          color: '#666', 
          fontSize: '16px'
        }}>
          juan.perez@cocoapp.com
        </p>
        <div style={{
          backgroundColor: '#E8F5E8',
          color: '#4CAF50',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'inline-block'
        }}>
          Plan Premium
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#333', 
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Mi Actividad
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007AFF' }}>
              2
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Fincas
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
              205
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Frutos
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
              30
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Días Activo
            </div>
          </div>
        </div>
      </div>

      {/* Menú de opciones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '16px 20px',
              borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <div style={{ fontSize: '24px' }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: item.title === 'Cerrar Sesión' ? '#F44336' : '#333',
                marginBottom: '2px'
              }}>
                {item.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666' 
              }}>
                {item.subtitle}
              </div>
            </div>
            <div style={{ fontSize: '16px', color: '#ccc' }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileScreen