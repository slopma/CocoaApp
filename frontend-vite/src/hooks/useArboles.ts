import { useEffect, useState } from "react";
import { supabase } from "../utils/SupabaseClient";
import type { Arbol, Fruto } from "../types";
import { useLotes } from "./useLotes";
import { useCultivos } from "./useCultivos";
import * as turf from "@turf/turf";
import { getOffsetFromHash } from "../hooks/geoUtils";

export function useArboles() {
  const [arbolesData, setArbolesData] = useState<Arbol[] | null>(null);
  const { lotesData } = useLotes();
  const { cultivosData } = useCultivos();

  useEffect(() => {
    const fetchArboles = async () => {
      const { data, error } = await supabase.rpc("get_arboles_with_frutos");
      if (error) {
        console.error("Error cargando árboles:", error);
        return;
      }

      const arbolesMap: Record<string, Arbol> = {};

      (data as any[]).forEach((row) => {
        if (!arbolesMap[row.arbol_id]) {
          arbolesMap[row.arbol_id] = {
            arbol_id: row.arbol_id,
            cultivo_id: row.cultivo_id,
            codigo_interno: row.codigo_interno,
            ubicacion: row.ubicacion,
            estado_arbol: row.estado_arbol,
            frutos: [],
          };
        }

        if (row.fruto_id) {
          arbolesMap[row.arbol_id].frutos.push({
            fruto_id: row.fruto_id,
            estado_fruto: row.estado_fruto,
          } as Fruto);
        }
      });

      let arboles = Object.values(arbolesMap);

      if (lotesData && cultivosData) {
        const centroidesPorLote: Record<string, [number, number]> = {};

        lotesData.features.forEach((feature) => {
          const centroide = turf.centroid(feature);
          const coords = centroide.geometry.coordinates;
          centroidesPorLote[feature.properties.nombre] = [coords[1], coords[0]];
        });

        const cultivoPorId: Record<string, string> = {};
        cultivosData.features.forEach((f) => {
          cultivoPorId[f.properties.cultivo_id] = f.properties.lote;
        });

        arboles = arboles.map((a) => {
          if (a.ubicacion) return a;

          const loteNombre = cultivoPorId[a.cultivo_id];
          const centro = centroidesPorLote[loteNombre];
          if (!centro) return a;

          const [latOffset, lngOffset] = getOffsetFromHash(a.arbol_id, 0.0003);

          return {
            ...a,
            ubicacion: {
              type: "Point",
              coordinates: [centro[1] + lngOffset, centro[0] + latOffset],
            },
          };
        });
      }

      setArbolesData(arboles);
    };

    fetchArboles();
  }, [lotesData, cultivosData]);

  return { arbolesData };
}