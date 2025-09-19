import { Marker, Popup } from "react-leaflet";
import type { Point } from "geojson";
import { ArbolIcon, getIconForEstado } from "../utils/mapIcons";

interface FrutoMap {
  fruto_id: string;
  especie?: string;
  estado_fruto?: string;
}
interface ArbolMap {
  arbol_id: string;
  nombre: string;
  estado_arbol?: string;
  ubicacion: Point | null; 
  frutos: FrutoMap[];
}

interface Props {
  arbol: ArbolMap;
  selected: string | null;
  onSelect: (id: string) => void;
  getNombreEstado: (id?: string) => string; 
}

const ArbolMarker: React.FC<Props> = ({ arbol, selected, onSelect }) => {
  const coords = arbol.ubicacion?.coordinates as [number, number] | undefined;
  if (!coords) return null;

  return (
    <Marker
      key={arbol.arbol_id}
      position={[coords[1], coords[0]]}
      icon={ArbolIcon}
      eventHandlers={{ click: () => onSelect(arbol.arbol_id) }}
    >
      {selected === arbol.arbol_id && (
        <Popup>
          <div>
            <h4>{arbol.nombre}</h4>
            <p><b>Estado árbol:</b> {arbol.estado_arbol ?? "Desconocido"}</p>
            <h5>Frutos:</h5>
            {arbol.frutos.length > 0 ? (
            <ul>
                {arbol.frutos.map((fr) => (
                <li key={fr.fruto_id} className="flex items-center gap-2">
                    <img
                    src={getIconForEstado(fr.estado_fruto ?? "").options.iconUrl}
                    alt={fr.estado_fruto}
                    style={{ width: "22px", height: "22px" }}
                    />
                    <span>{fr.especie} - {fr.estado_fruto}</span>
                </li>
                ))}
            </ul>
            ) : (
            <p>Sin frutos registrados</p>
            )}

          </div>
        </Popup>
      )}
    </Marker>
  );
};

export default ArbolMarker;
