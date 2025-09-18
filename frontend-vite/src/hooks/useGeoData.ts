import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/SupabaseClient";

export function useGeoData(onReady?: (geojson: any) => void) {
  const [geodata, setGeoData] = useState<any>({
    type: "FeatureCollection",
    features: [],
  });
  const hasAnalyzed = useRef(false);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const { data: lotes, error } = await supabase.rpc("get_lotes_with_estado");
        if (error) throw error;

        const geojson = {
          type: "FeatureCollection",
          features: (lotes || []).map((lote: any) => ({
            type: "Feature",
            geometry: lote.geometry,
            properties: {
              lote_id: lote.lote_id,
              nombre: lote.nombre,
              finca: lote.finca_nombre || "Sin finca",
              estado: lote.estado?.toLowerCase() || "",
            },
          })),
        };

        setGeoData(geojson);

        if (!hasAnalyzed.current && onReady) {
          onReady(geojson);
          hasAnalyzed.current = true;
        }
      } catch (err) {
        console.error("Error al cargar lotes desde Supabase:", err);
      }
    };

    fetchLotes();
  }, [onReady]);

  return { geodata };
}
