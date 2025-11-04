
import L from "leaflet";

// 🔹 Base pública de tu bucket en Supabase
const supabaseBaseUrl =
  "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/cocoa-icons/";

// 🔹 Icono fijo para árboles
export const ArbolIcon = L.icon({
  iconUrl: `${supabaseBaseUrl}/cacao-arbol.png`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// 🔹 Mapear estado del fruto a ícono
export const estadoToIconUrl: Record<string, string> = {
  inmaduro: `${supabaseBaseUrl}/azul.png`,
  transición: `${supabaseBaseUrl}/amarillo.png`,
  maduro: `${supabaseBaseUrl}/verde.png`,
  enfermo: `${supabaseBaseUrl}/rojo.png`,
};

// 🔹 Retorna ícono de fruto según estado
export const getIconForEstado = (estado: string) =>
  L.icon({
    iconUrl: estadoToIconUrl[estado?.toLowerCase()] || estadoToIconUrl.inmaduro,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
