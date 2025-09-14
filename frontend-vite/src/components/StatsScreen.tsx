import React from 'react'

const StatsScreen: React.FC = () => {
  // Datos para el gráfico simple
  const produccionData = [
    { mes: 'Ene', valor: 30 },
    { mes: 'Feb', valor: 25 },
    { mes: 'Mar', valor: 40 },
    { mes: 'Abr', valor: 35 },
    { mes: 'May', valor: 50 },
    { mes: 'Jun', valor: 45 }
  ];

  const maxValor = Math.max(...produccionData.map(d => d.valor));

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

      {/* Gráfico simple con CSS */}
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
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          padding: '20px 10px 10px 10px'
        }}>
          {produccionData.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              maxWidth: '50px'
            }}>
              <div style={{
                backgroundColor: '#4CAF50',
                width: '30px',
                height: `${(item.valor / maxValor) * 140}px`,
                borderRadius: '4px 4px 0 0',
                marginBottom: '8px',
                position: 'relative',
                transition: 'height 0.3s ease'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {item.valor}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                fontWeight: '500'
              }}>
                {item.mes}
              </div>
            </div>
          ))}
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
