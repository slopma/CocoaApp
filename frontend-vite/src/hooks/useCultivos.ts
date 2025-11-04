// hooks/useCultivos.ts
import { useEffect, useState } from "react";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export const useCultivos = () => {
  const [cultivosData, setCultivosData] = useState<FeatureCollection<Geometry, GeoJsonProperties> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCultivos = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/cultivos`);
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
        }
        const data: FeatureCollection<Geometry, GeoJsonProperties> = await res.json();
        console.log('✅ Cultivos cargados:', data.features?.length || 0);
        setCultivosData(data);
      } catch (err: any) {
        console.error("❌ Error cargando cultivos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCultivos();
  }, []);

  return { cultivosData, loading, error };
};
