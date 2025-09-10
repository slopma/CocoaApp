import React from 'react'

const StatsScreen: React.FC = () => {
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
        Estadísticas
      </h2>
      
      {/* Tarjetas de resumen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>
            205
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Total Frutos
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>
            7
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Enfermedades
          </div>
        </div>
      </div>

      {/* Gráfico placeholder */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
          Producción Mensual
        </h3>
        <div style={{
          height: '200px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '16px'
        }}>
          📊 Gráfico de producción
        </div>
      </div>

      {/* Estado de salud */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
          Estado de Salud
        </h3>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '6px' 
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Frutos Sanos</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>85%</span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '85%',
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '6px' 
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Frutos Enfermos</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>15%</span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '15%',
              height: '100%',
              backgroundColor: '#F44336',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsScreen