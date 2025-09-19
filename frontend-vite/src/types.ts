// src/types.ts

// Representa un Lote
export interface Lote {
  lote_id: string;
  nombre: string;
  finca: string;
  estado: string;
  geometry: GeoJSON.Geometry;
}

// Representa un Cultivo dentro de un Lote
export interface Cultivo {
  cultivo_id: string;
  nombre: string;
  lote_id: string;
  lote_nombre: string;
  geometry: GeoJSON.Geometry;
}

// Representa un Fruto de un Árbol
export interface Fruto {
  fruto_id: string;
  estado_fruto: string;
  especie?: string;  
}

// Representa un Árbol con frutos
export interface Arbol {
  arbol_id: string;
  cultivo_id: string;
  nombre: string;
  ubicacion: GeoJSON.Point | null;
  estado_arbol: string;
  frutos: Fruto[];
}
