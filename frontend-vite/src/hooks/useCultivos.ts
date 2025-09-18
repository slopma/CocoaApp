// hooks/useCultivos.ts
import { useEffect, useState } from "react";
import { supabase } from "../utils/SupabaseClient";

export const useCultivos = () => {
  const [cultivosData, setCultivosData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    const fetchCultivos = async () => {
      const { data, error } = await supabase
        .from("cultivo")
        .select("cultivo_id, nombre, especie, poligono");

      if (error) {
        console.error("❌ Error cargando cultivos:", error);
        return;
      }

      const features = data.map((c) => ({
        type: "Feature",
        geometry: c.poligono, // ya es GeoJSON
        properties: {
          cultivo_id: c.cultivo_id,
          nombre: c.nombre,
          especie: c.especie,
        },
      }));

      setCultivosData({
        type: "FeatureCollection",
        features,
      });
    };

    fetchCultivos();
  }, []);

  return { cultivosData };
};

