import { useEffect, useState } from "react";

export function useGeoData(onReady?: (analysis: any) => void, shouldFetch = true) {
  const [geodata, setGeoData] = useState<any>({
    type: "FeatureCollection",
    features: [],
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchZoneAnalysis = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/zone-analysis/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        setGeoData(data.geojson);
        setStats(data.stats);

        if (onReady) {
          console.log("🔔 Ejecutando onReady");
          onReady(data);
        }
      } catch (err) {
        console.error("Error al cargar análisis de zonas:", err);
      }
    };

    fetchZoneAnalysis();
  }, [shouldFetch]); // Depende de shouldFetch

  return { geodata, stats };
}
