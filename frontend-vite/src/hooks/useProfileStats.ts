import { useState, useEffect } from "react";

interface ProfileStats {
  fincas: number;
  frutos: number;
  zonas: number;
  arboles: number;
}

export const useProfileStats = () => {
  const [stats, setStats] = useState<ProfileStats>({
    fincas: 0,
    frutos: 0,
    zonas: 0,
    arboles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        setLoading(true);
        
        // Obtener estadísticas generales del backend
        const res = await fetch("http://localhost:8000/stats/");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        // Extraer los datos del resumen general
        const generalStats = data.resumen_general;
        const estructura = generalStats.estructura;
        
        setStats({
          fincas: estructura.fincas || 0,
          frutos: estructura.frutos || 0,
          zonas: estructura.lotes || 0, // Usar lotes como zonas
          arboles: estructura.arboles || 0,
        });
        
        console.log("📊 Profile stats loaded:", {
          fincas: estructura.fincas,
          frutos: estructura.frutos,
          zonas: estructura.lotes,
          arboles: estructura.arboles,
        });
        
      } catch (err: any) {
        console.error("❌ Error loading profile stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, []);

  return { stats, loading, error };
};
