import L from "leaflet";
import CacaoInmaduro from "../assets/Cacaos/Caco-Inmaduro.png";
import CacaoTransicion from "../assets/Cacaos/Cacao-en-Transición.png";
import CacaoMaduro from "../assets/Cacaos/Cacao-maduro.png";
import CacaoEnfermo from "../assets/Cacaos/Cacao-Enfermo.png";
import ArbolCacao from "../assets/Cacaos/arbol-de-cacao.png";

// 🔹 Icono fijo para árboles
export const ArbolIcon = L.icon({
  iconUrl: ArbolCacao,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// 🔹 Mapear estado del fruto a ícono
export const estadoToIconUrl: Record<string, string> = {
  inmaduro: CacaoInmaduro,
  transicion: CacaoTransicion,
  maduro: CacaoMaduro,
  enfermo: CacaoEnfermo,
};

// 🔹 Retorna ícono de fruto según estado
export const getIconForEstado = (estado: string) =>
  L.icon({
    iconUrl: estadoToIconUrl[estado?.toLowerCase()] || CacaoInmaduro,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
