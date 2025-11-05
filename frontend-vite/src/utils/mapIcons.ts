
import L from "leaflet";

// 🔹 Base pública de tu bucket en Supabase
const supabaseBaseUrl =
  "https://zlkdxzfxkhohlpswdmap.storage.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/cocoa-icons";

// 🔹 Icono fijo para árboles
export const ArbolIcon = L.icon({
  iconUrl: `${supabaseBaseUrl}/arbol-de-cacao.png`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// 🔹 Mapear estado del fruto a ícono
export const estadoToIconUrl: Record<string, string> = {
  inmaduro: `${supabaseBaseUrl}/Caco-Inmaduro.png`,
  transición: `${supabaseBaseUrl}/Cacao-en-Transicion.png`,
  maduro: `${supabaseBaseUrl}/Cacao-maduro.png`,
  enfermo: `${supabaseBaseUrl}/Cacao-Enfermo.png`,
};

// 🔹 Retorna ícono de fruto según estado
export const getIconForEstado = (estado: string) =>
  L.icon({
    iconUrl: estadoToIconUrl[estado?.toLowerCase()] || estadoToIconUrl.inmaduro,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
