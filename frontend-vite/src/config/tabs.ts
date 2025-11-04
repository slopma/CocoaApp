// 🔹 Base URL para los íconos de la app en Supabase
const supabaseIconsBaseUrl = "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/app-icons";

const hogarIcon = `${supabaseIconsBaseUrl}/hogar.png`;
const ubicacionIcon = `${supabaseIconsBaseUrl}/ubicacion.png`;
const contactoIcon = `${supabaseIconsBaseUrl}/contacto.png`;
const usuarioIcon = `${supabaseIconsBaseUrl}/usuario.png`;

export const tabs = [
  { id: "map", icon: hogarIcon, label: "Inicio" },
  { id: "zones", icon: ubicacionIcon, label: "Zonas" },
  { id: "stats", icon: contactoIcon, label: "Estadísticas" },
  { id: "profile", icon: usuarioIcon, label: "Perfil" },
] as const;

export type TabId = typeof tabs[number]["id"];
