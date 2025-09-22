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
      try {
        const res = await fetch("http://localhost:8000/cultivos");
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }
        const data: FeatureCollection<Geometry, GeoJsonProperties> = await res.json();
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
