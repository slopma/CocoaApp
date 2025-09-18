/**
 * Aplica una dispersión aleatoria leve a coordenadas [lat, lng]
 * para evitar solapamiento visual en el mapa.
 */
export function applyRandomOffset(
  lat: number,
  lng: number,
  delta: number = 0.0001
): [number, number] {
  const offsetLat = lat + (Math.random() - 0.5) * delta;
  const offsetLng = lng + (Math.random() - 0.5) * delta;
  return [offsetLat, offsetLng];
}

/**
 * Genera un hash numérico simple y determinístico a partir de un string.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convertir a 32 bits
  }
  return Math.abs(hash);
}

/**
 * Genera un offset determinístico para un árbol según su ID.
 * Retorna [latOffset, lngOffset] dentro de un rango controlado.
 */
export function getOffsetFromHash(id: string, delta = 0.0001): [number, number] {
  const hash1 = simpleHash(id);
  const hash2 = simpleHash(id.split("").reverse().join()); // variante

  const latOffset = ((hash1 % 1000) / 1000 - 0.5) * delta;
  const lngOffset = ((hash2 % 1000) / 1000 - 0.5) * delta;

  return [latOffset, lngOffset];
}