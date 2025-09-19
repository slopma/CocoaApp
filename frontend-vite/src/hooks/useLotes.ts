import { useEffect, useState } from "react";
import { supabase } from "../utils/SupabaseClient";
import type { Lote } from "../types/db";

export function useLotes() {
  const [lotesData, setLotesData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    const fetchLotes = async () => {
      const { data, error } = await supabase.rpc("get_lotes_with_estado");
      if (error) {
        console.error("Error cargando lotes:", error);
        return;
      }

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.map((l: Lote) => ({
          type: "Feature",
          geometry: l.geometry,
          properties: {
            lote_id: l.lote_id,
            nombre: l.nombre,
            finca: l.finca,
            estado: l.estado,
          },
        })),
      };

      setLotesData(geojson);
    };

    fetchLotes();
  }, []);

  return { lotesData };
}
