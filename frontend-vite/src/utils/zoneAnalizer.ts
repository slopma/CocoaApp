export function analyzeZones(geojson: any, createNotificationWithToast: Function, setActiveTab: Function) {
  if (!geojson || !geojson.features) return;

  const productiveLots = geojson.features.filter((feature: any) => {
    const nombre = feature.properties?.nombre?.toLowerCase() || "";
    const estado = feature.properties?.estado?.toLowerCase() || "";
    return !nombre.includes("administracion") && !nombre.includes("admin") && estado !== "";
  });

  const stats = {
    inmaduro: [] as string[],
    transicion: [] as string[],
    maduro: [] as string[],
    enfermo: [] as string[],
    total: productiveLots.length,
  };

  productiveLots.forEach((feature: any) => {
    const estado = feature.properties?.estado;
    const loteNombre = feature.properties?.nombre || "Sin nombre";

    if (estado === "inmaduro") stats.inmaduro.push(loteNombre);
    else if (estado === "transicion") stats.transicion.push(loteNombre);
    else if (estado === "maduro") stats.maduro.push(loteNombre);
    else if (estado === "enfermo") stats.enfermo.push(loteNombre);
  });

  generateSmartNotifications(stats, createNotificationWithToast, setActiveTab);
}

function generateSmartNotifications(stats: any, createNotificationWithToast: Function, setActiveTab: Function) {
  const { transicion, maduro, enfermo, total } = stats;

  // Ejemplo simplificado: Enfermos primero
  if (enfermo.length > 0) {
    createNotificationWithToast(
      "error",
      "Lotes enfermos",
      `🚨 ${enfermo.length} lotes enfermos: ${enfermo.join(", ")}`,
      {
        duration: 12000,
        action: { label: "Ver mapa", onClick: () => setActiveTab("map") },
      }
    );
  }

  // Listos para cosecha
  if (maduro.length > 0) {
    createNotificationWithToast(
      "warning",
      "Listos para cosecha",
      `🍫 ${maduro.length} lotes listos: ${maduro.join(", ")}`,
      {
        duration: 8000,
        action: { label: "Ver ubicaciones", onClick: () => setActiveTab("map") },
      }
    );
  }

  // Ejemplo: progreso
  const totalAvanzado = maduro.length + transicion.length;
  if (totalAvanzado > 0) {
    const porcentaje = ((totalAvanzado / total) * 100).toFixed(1);
    createNotificationWithToast(
      "success",
      "Progreso",
      `📈 ${porcentaje}% de la finca está en etapa avanzada`,
      { duration: 6000 }
    );
  }
}
