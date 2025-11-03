import { useEffect, useState } from "react";

export function useLotes() {
  const [lotesData, setLotesData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/lotes`);
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
        }
        const geojson = await res.json();
        console.log('✅ Lotes cargados:', geojson.features?.length || 0);
        setLotesData(geojson);
      } catch (err: any) {
        console.error("❌ Error cargando lotes desde API:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, []);

  return { lotesData, loading, error };
}
