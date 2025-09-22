import { useEffect, useState } from "react";
import type { Arbol } from "../types/db";

export function useArboles() {
  const [arbolesData, setArbolesData] = useState<Arbol[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArboles = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/arboles");
        const json = await res.json();
        setArbolesData(json.arboles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArboles();
  }, []);

  return { arbolesData, loading, error };
}
