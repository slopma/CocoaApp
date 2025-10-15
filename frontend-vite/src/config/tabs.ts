import hogarIcon from "../utils/icons/hogar.png";
import ubicacionIcon from "../utils/icons/ubicacion.png";
import contactoIcon from "../utils/icons/contacto.png";
import usuarioIcon from "../utils/icons/usuario.png";

export const tabs = [
  { id: "map", icon: hogarIcon, label: "Inicio" },
  { id: "zones", icon: ubicacionIcon, label: "Zonas" },
  { id: "stats", icon: contactoIcon, label: "Estadísticas" },
  { id: "profile", icon: usuarioIcon, label: "Perfil" },
] as const;

export type TabId = typeof tabs[number]["id"];
