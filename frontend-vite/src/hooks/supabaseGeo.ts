// utils/supabaseGeo.ts
import { supabase } from "../utils/SupabaseClient";



// ✅ actualizar polígono del cultivo usando la función RPC
export async function upsertCultivo(cultivo_id: string, geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon) {
  const { error } = await supabase.rpc("update_cultivo_geom", {
    cultivo_id,
    geojson: ensureMultiPolygon(geojson),
    });

  if (error) {
    console.error("❌ Error actualizando cultivo:", error);
    throw error;
  }
}

// ✅ actualizar ubicación del árbol
export async function updateArbol(arbol_id: string, point: GeoJSON.Point) {
  const { error } = await supabase
    .from("arbol")
    .update({ ubicacion: point })
    .eq("arbol_id", arbol_id);

  if (error) {
    console.error("❌ Error actualizando árbol:", error);
    throw error;
  }
}

function ensureMultiPolygon(geo: GeoJSON.Polygon | GeoJSON.MultiPolygon): GeoJSON.MultiPolygon {
  if (geo.type === "Polygon") {
    return {
      type: "MultiPolygon",
      coordinates: [geo.coordinates],
    };
  }
  return geo;
}
