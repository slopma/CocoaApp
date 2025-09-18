// Función hash simple para convertir un string (fruto_id) en un número
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convierte a 32 bits
  }
  return hash;
}

/**
 * Genera un offset pequeño (lat, lng) a partir del fruto_id
 * para dispersar los frutos de forma determinística
 */
export function getFrutoOffset(frutoId: string): [number, number] {
  const hash = hashCode(frutoId);

  // Radio máximo en grados (~10 metros aprox)
  const maxOffset = 0.0001;

  // Calculamos ángulo y radio pseudoaleatorios pero determinísticos
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = ((hash % 1000) / 1000) * maxOffset;

  const latOffset = Math.sin(angle) * radius;
  const lngOffset = Math.cos(angle) * radius;

  return [latOffset, lngOffset];
}
