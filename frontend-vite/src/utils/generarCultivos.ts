import circle from "@turf/circle";
import type { Arbol } from "../types";
import type { FeatureCollection, Polygon } from "geojson";
import type { Feature } from "geojson";


/**
 * Genera cultivos circulares centrados en cada árbol.
 * @param arboles Lista de árboles con ubicación.
 * @param radio Radio del cultivo en metros.
 */
export function generarCultivosCirculares(
  arboles: Arbol[],
  radio = 10
): FeatureCollection {
  const cultivos = arboles
    .filter((a) => a.ubicacion?.coordinates)
    .map((a, i) =>
      circle(a.ubicacion.coordinates, radio, {
        steps: 32,
        units: "meters",
        properties: {
          cultivo_id: `cultivo_${i}`,
          arbol_id: a.arbol_id,
          nombre: `Cultivo_${a.codigo_interno}`,
        },
      })
    );

  return {
    type: "FeatureCollection",
    features: cultivos as Feature<Polygon>[],
  };
}

export function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}