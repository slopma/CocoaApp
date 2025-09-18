import * as turf from "@turf/turf";

const centroidPorLote: Record<string, [number, number]> = {};

lotesData.features.forEach((feature) => {
  const centroide = turf.centroid(feature);
  const coords = centroide.geometry.coordinates; // [lng, lat]
  const loteId = feature.properties.lote_id;
  centroidPorLote[loteId] = [coords[1], coords[0]]; // [lat, lng]
});