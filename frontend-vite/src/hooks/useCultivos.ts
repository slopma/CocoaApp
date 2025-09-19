// hooks/useCultivos.ts
import { useEffect, useState } from "react";
import { supabase } from "../utils/SupabaseClient";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export const useCultivos = () => {
  const [cultivosData, setCultivosData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    const fetchCultivos = async () => {
      const { data, error } = await supabase
        .from("cultivo")
        .select("cultivo_id, nombre, especie, poligono");

      if (error) {
        console.error("❌ Error cargando cultivos:", error);
        return;
      }

      const features: Feature<Geometry, GeoJsonProperties>[] = data.map((c): Feature<Geometry, GeoJsonProperties> => ({
        type: "Feature",
        geometry: c.poligono as Geometry,
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


