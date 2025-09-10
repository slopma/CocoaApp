import { toast } from 'sonner'

export const NotificationTypes = {
  HARVEST_READY: 'harvest_ready',
  DEVELOPMENT: 'development', 
  PRODUCTIVITY: 'productivity',
  URGENT_HARVEST: 'urgent_harvest'
}

export const createZoneNotification = (type: string, data: any) => {
  switch (type) {
    case NotificationTypes.HARVEST_READY:
      return toast.warning(
        `Lote "${data.loteName}" está listo para cosecha 🌾`,
        {
          description: 'El cacao ha alcanzado la madurez óptima',
          duration: 7000,
          action: {
            label: 'Ver ubicación',
            onClick: () => {
              console.log('Centrando mapa en:', data.loteId)
            }
          }
        }
      )
    
    case NotificationTypes.DEVELOPMENT:
      return toast.info(
        `Lote "${data.loteName}" en desarrollo 🌱`,
        {
          description: `Seguimiento del crecimiento del cacao`,
          duration: 4000
        }
      )

    case NotificationTypes.PRODUCTIVITY:
      return toast.success(
        `¡Excelente productividad! 📈`,
        {
          description: `${data.percentage}% de la finca completada`,
          duration: 5000
        }
      )
      
    case NotificationTypes.URGENT_HARVEST:
      return toast.error(
        '🚨 Cosecha urgente requerida',
        {
          description: `${data.count} lotes necesitan atención inmediata`,
          duration: 8000
        }
      )
  }
}

// Función para analizar zonas
export const analyzeZoneData = (geodata: any) => {
  if (!geodata?.features) return null;
  
  const stats = {
    inmaduro: 0,
    maduro: 0,
    cosechado: 0,
    total: geodata.features.length
  };

  geodata.features.forEach((feature: any) => {
    const estado = feature.properties?.Estado?.toLowerCase();
    if (estado === 'inmaduro') stats.inmaduro++;
    else if (estado === 'maduro') stats.maduro++;
    else if (estado === 'cosechado') stats.cosechado++;
  });

  return stats;
};
