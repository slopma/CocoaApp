import { useEffect, useState } from "react";
import type { Arbol } from "../types/db";

export function useArboles() {
  const [arbolesData, setArbolesData] = useState<Arbol[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArboles = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/arboles`);
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        console.log('✅ Árboles cargados:', json.arboles?.length || 0);
        setArbolesData(json.arboles || []);
      } catch (err: any) {
        console.error('❌ Error cargando árboles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArboles();
  }, []);

  return { arbolesData, loading, error };
}
