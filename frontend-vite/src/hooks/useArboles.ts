import { useEffect, useState } from "react";
import { supabase } from "../utils/SupabaseClient";
import type { Arbol } from "../types/db";
import { useLotes } from "./useLotes";
import { useCultivos } from "./useCultivos";
import * as turf from "@turf/turf";
import { getOffsetFromHash } from "../hooks/geoUtils";

export function useArboles() {
  const [arbolesData, setArbolesData] = useState<Arbol[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { lotesData } = useLotes();
  const { cultivosData } = useCultivos();

  // 👉 estado_cacao
  const [estados, setEstados] = useState<{ estado_cacao_id: string; nombre: string }[]>([]);

  useEffect(() => {
    const fetchEstados = async () => {
      const { data, error } = await supabase
        .from("estado_cacao")
        .select("estado_cacao_id, nombre");
      if (!error && data) setEstados(data);
    };
    fetchEstados();
  }, []);

  const getNombreEstado = (id?: string) =>
    estados.find((e) => e.estado_cacao_id === id)?.nombre || "Desconocido";

  useEffect(() => {
    const fetchArboles = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("get_arboles_with_frutos");

      if (error) {
        console.error("Error cargando árboles:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      // 👇 Ya viene con frutos en el JSON → solo normalizamos
      let arboles: Arbol[] = (data as any[]).map((row) => ({
        arbol_id: row.arbol_id,
        cultivo_id: row.cultivo_id,
        nombre: row.nombre,
        ubicacion: row.ubicacion,
        estado_arbol: row.estado_arbol,
        frutos: row.frutos ?? [], // <-- usamos directamente el array que devuelve el RPC
      }));

      // 2. Completar ubicaciones faltantes con centroides
      if (lotesData && cultivosData) {
        const centroidesPorLote: Record<string, [number, number]> = {};

        lotesData.features.forEach((feature) => {
          const centroide = turf.centroid(feature);
          const coords = centroide.geometry.coordinates;
          centroidesPorLote[feature.properties?.nombre] = [coords[1], coords[0]];
        });

        const cultivoPorId: Record<string, string> = {};
        cultivosData.features.forEach((f) => {
          cultivoPorId[f.properties?.cultivo_id] = f.properties?.lote;
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
      setLoading(false);
    };

    fetchArboles();
  }, [lotesData, cultivosData]);

  return { arbolesData, loading, error, getNombreEstado };
}
