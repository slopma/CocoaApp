import { useState, useEffect, useRef } from 'react'
import './App.css'
import Map from './components/Map'
import BottomNavigation from './components/BottomNavigation'
import ZonesScreen from './components/ZonesScreen'
import StatsScreen from './components/StatsScreen'
import ProfileScreen from './components/ProfileScreen'
import { Toaster, toast } from 'sonner'
import { createZoneNotification, NotificationTypes } from './utils/notifications'

function App() {
  const [activeTab, setActiveTab] = useState('map')
  const [geodata, setGeoData] = useState(null)
  const hasAnalyzed = useRef(false)

  useEffect(() => {
    fetch("/data/lotes.geojson")
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data)
        if (!hasAnalyzed.current) {
          analyzeZones(data)
          hasAnalyzed.current = true
        }
      })
      .catch((err) => console.error("Error al cargar GeoJSON", err));
  }, [])

  // Simular alertas usando el módulo de notificaciones (intervalos más espaciados)
  useEffect(() => {
    const timers: number[] = [] as unknown as number[];
    timers.push(window.setTimeout(() => {
      createZoneNotification(NotificationTypes.DEVELOPMENT, { loteName: 'Zona 1' });
    }, 5000));

    timers.push(window.setTimeout(() => {
      createZoneNotification(NotificationTypes.HARVEST_READY, { loteName: 'Zona 3', loteId: 3 });
    }, 12000));

    timers.push(window.setTimeout(() => {
      createZoneNotification(NotificationTypes.URGENT_HARVEST, { count: 2 });
    }, 20000));

    timers.push(window.setTimeout(() => {
      createZoneNotification(NotificationTypes.PRODUCTIVITY, { percentage: 12 });
    }, 30000));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [])

  const analyzeZones = (data: any) => {
    if (!data || !data.features) return;

    // Filtrar zonas administrativas
    const productiveLots = data.features.filter((feature: any) => {
      const lote = feature.properties?.Lote?.toLowerCase() || '';
      const estado = feature.properties?.Estado?.toLowerCase() || '';
      return !lote.includes('administracion') && 
             !lote.includes('admin') && 
             !estado.includes('administracion') &&
             estado !== '';
    });

    const stats = {
      inmaduro: [],
      transicion: [],
      maduro: [],
      enfermo: [],
      total: productiveLots.length
    };

    // Agrupar lotes por estado con sus nombres
    productiveLots.forEach((feature: any) => {
      const estado = feature.properties?.Estado?.toLowerCase();
      const loteNombre = feature.properties?.Lote || 'Sin nombre';
      
      if (estado === 'inmaduro') stats.inmaduro.push(loteNombre);
      else if (estado === 'transicion') stats.transicion.push(loteNombre);
      else if (estado === 'maduro') stats.maduro.push(loteNombre);
      else if (estado === 'enfermo') stats.enfermo.push(loteNombre);
    });

    generateSmartNotifications(stats);
  };

  const generateSmartNotifications = (stats: any) => {
    const { inmaduro, transicion, maduro, enfermo, total } = stats;

    // Contar estados activos
    const activeStates = [
      inmaduro.length > 0 ? 'inmaduro' : null,
      transicion.length > 0 ? 'transicion' : null,
      maduro.length > 0 ? 'maduro' : null,
      enfermo.length > 0 ? 'enfermo' : null
    ].filter(Boolean);

    const totalActive = inmaduro.length + transicion.length + maduro.length + enfermo.length;

    // 🚨 PRIORIDAD MÁXIMA: Lotes enfermos
    if (enfermo.length > 0) {
      if (enfermo.length === 1) {
        toast.error(
          `🚨 URGENTE: El lote "${enfermo[0]}" está enfermo y necesita atención inmediata`,
          {
            duration: 12000,
            action: {
              label: 'Ver ubicación',
              onClick: () => setActiveTab('map')
            }
          }
        );
      } else if (enfermo.length === total) {
        toast.error(
          `🚨 CRÍTICO: Todos los lotes de la finca están enfermos`,
          {
            duration: 15000,
            action: {
              label: 'Ver mapa',
              onClick: () => setActiveTab('map')
            }
          }
        );
      } else {
        toast.error(
          `🚨 URGENTE: ${enfermo.length} lotes están enfermos: ${enfermo.join(', ')}`,
          {
            duration: 12000,
            action: {
              label: 'Ver ubicaciones',
              onClick: () => setActiveTab('map')
            }
          }
        );
      }
    }

    // ⚠️ Lotes maduros listos para cosecha
    if (maduro.length > 0) {
      if (maduro.length === 1) {
        toast.warning(
          `🍫 El lote "${maduro[0]}" está maduro y listo para cosecha`,
          {
            duration: 8000,
            action: {
              label: 'Ver ubicación',
              onClick: () => setActiveTab('map')
            }
          }
        );
      } else if (maduro.length === total && activeStates.length === 1) {
        toast.warning(
          `🍫 Todos los lotes de la finca están maduros y listos para cosecha`,
          {
            duration: 10000,
            action: {
              label: 'Ver mapa',
              onClick: () => setActiveTab('map')
            }
          }
        );
      } else {
        toast.warning(
          `🍫 ${maduro.length} lotes listos para cosecha: ${maduro.join(', ')}`,
          {
            duration: 8000,
            action: {
              label: 'Ver ubicaciones',
              onClick: () => setActiveTab('map')
            }
          }
        );
      }
    }

    // 📊 Estados de desarrollo (solo si hay mezcla o todos iguales)
    if (activeStates.length === 1 && totalActive === total) {
      // Todos los lotes están en el mismo estado
      const estadoUnico = activeStates[0];
      const estadoTexto = {
        inmaduro: 'desarrollo inicial',
        transicion: 'fase de transición',
        maduro: 'maduros',
        enfermo: 'enfermos'
      }[estadoUnico];

      if (estadoUnico !== 'enfermo' && estadoUnico !== 'maduro') {
        toast.info(
          `🌱 Todos los lotes de la finca se encuentran en ${estadoTexto}`,
          { duration: 6000 }
        );
      }
    } else {
      // Hay mezcla de estados - mostrar solo los de desarrollo
      if (inmaduro.length > 0 && inmaduro.length < total) {
        if (inmaduro.length === 1) {
          toast.info(
            `🌱 El lote "${inmaduro[0]}" se encuentra en desarrollo inicial`,
            { duration: 5000 }
          );
        } else {
          toast.info(
            `🌱 ${inmaduro.length} lotes en desarrollo inicial`,
            { duration: 5000 }
          );
        }
      }

      if (transicion.length > 0 && transicion.length < total) {
        if (transicion.length === 1) {
          toast.info(
            `🌿 El lote "${transicion[0]}" se encuentra en fase de transición`,
            { duration: 5000 }
          );
        } else {
          toast.info(
            `🌿 ${transicion.length} lotes en fase de transición`,
            { duration: 5000 }
          );
        }
      }
    }

    // 📈 Resumen de productividad (solo si hay diversidad)
    if (activeStates.length > 1) {
      const porcentajeDesarrollado = (((maduro.length + transicion.length) / total) * 100).toFixed(1);
      if (maduro.length + transicion.length > 0) {
        toast.success(
          `📈 ${porcentajeDesarrollado}% de la finca está en etapa avanzada (${maduro.length + transicion.length}/${total} lotes)`,
          { duration: 6000 }
        );
      }
    }

    // 🚨 Alerta crítica para múltiples lotes maduros
    if (maduro.length >= 3) {
      toast.error(
        '⏰ URGENTE: Múltiples lotes requieren cosecha inmediata para evitar pérdidas',
        {
          duration: 10000,
          action: {
            label: 'Priorizar cosecha',
            onClick: () => {
              setActiveTab('zones')
              toast.info('Revisa la pestaña de zonas para planificar la cosecha')
            }
          }
        }
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <Map geodata={geodata} />
      case 'zones':
        return <ZonesScreen geodata={geodata} />
      case 'stats':
        return <StatsScreen geodata={geodata} />
      case 'profile':
        return <ProfileScreen />
      default:
        return <Map geodata={geodata} />
    }
  }

  return (
    <div className="app">
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        expand={true}
        toastOptions={{
          style: {
            fontSize: '14px'
          }
        }}
      />
      
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        {renderContent()}
      </main>
      
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
