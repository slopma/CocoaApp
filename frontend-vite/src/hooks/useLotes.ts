import { useEffect, useState } from "react";

export function useLotes() {
  const [lotesData, setLotesData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLotes = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/lotes");
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const geojson = await res.json();
        setLotesData(geojson);
      } catch (err: any) {
        console.error("Error cargando lotes desde API:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, []);

  return { lotesData, loading, error };
}
