import { toast } from 'sonner'

export const NotificationTypes = {
  HARVEST_READY: 'warning',
  DEVELOPMENT: 'info',
  PRODUCTIVITY: 'success',
  URGENT_HARVEST: 'error'
} as const;

// Variable para almacenar la función de callback del hook
let addNotificationCallback: ((notification: any) => void) | null = null;

// Función para registrar el callback
export const setNotificationCallback = (callback: (notification: any) => void) => {
  addNotificationCallback = callback;
};

export const createZoneNotification = (type: string, data: any) => {
  const notificationData = getNotificationData(type, data);
  
  // Guardar en el sistema de notificaciones
  if (addNotificationCallback && notificationData) {
    addNotificationCallback({
      type: notificationData.toastType,
      title: notificationData.title,
      message: notificationData.message
    });
  }

  // Mostrar toast como antes
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
      );

    case NotificationTypes.DEVELOPMENT:
      return toast.info(
        `Lote "${data.loteName}" en desarrollo 🌱`,
        {
          description: `Seguimiento del crecimiento del cacao`,
          duration: 4000
        }
      );

    case NotificationTypes.PRODUCTIVITY:
      return toast.success(
        `¡Excelente productividad! 📈`,
        {
          description: `${data.percentage}% de la finca completada`,
          duration: 5000
        }
      );

    case NotificationTypes.URGENT_HARVEST:
      return toast.error(
        '🚨 Cosecha urgente requerida',
        {
          description: `${data.count} lotes necesitan atención inmediata`,
          duration: 8000
        }
      );
  }
};

// Función auxiliar para obtener datos de notificación
const getNotificationData = (type: string, data: any) => {
  switch (type) {
    case NotificationTypes.HARVEST_READY:
      return {
        toastType: 'warning',
        title: 'Lote Listo para Cosecha',
        message: `Lote "${data.loteName}" está listo para cosecha 🌾`
      };
    case NotificationTypes.DEVELOPMENT:
      return {
        toastType: 'info',
        title: 'Lote en Desarrollo',
        message: `Lote "${data.loteName}" en desarrollo 🌱`
      };
    case NotificationTypes.PRODUCTIVITY:
      return {
        toastType: 'success',
        title: 'Excelente Productividad',
        message: `¡Excelente productividad! 📈 ${data.percentage}% completado`
      };
    case NotificationTypes.URGENT_HARVEST:
      return {
        toastType: 'error',
        title: 'Cosecha Urgente',
        message: `🚨 ${data.count} lotes necesitan atención inmediata`
      };
    default:
      return null;
  }
};

// Función para crear notificaciones personalizadas (para tus toasts complejos)
export const createCustomNotification = (
  type: 'error' | 'warning' | 'info' | 'success',
  title: string,
  message: string,
  addNotificationFn?: (notification: any) => void
) => {
  // Guardar en el sistema si se proporciona la función
  if (addNotificationFn) {
    addNotificationFn({
      type,
      title,
      message
    });
  }
  
  return { type, title, message };
};

// Función para analizar zonas (mantener como estaba)
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
