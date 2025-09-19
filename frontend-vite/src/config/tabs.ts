export const tabs = [
  { id: "map", icon: "🏠", label: "Inicio" },
  { id: "zones", icon: "📍", label: "Zonas" },
  { id: "stats", icon: "📊", label: "Estadísticas" },
  { id: "profile", icon: "👤", label: "Perfil" },
] as const;

export type TabId = typeof tabs[number]["id"];
