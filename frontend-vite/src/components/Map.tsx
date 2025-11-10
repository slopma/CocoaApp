import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import { useLotes } from "../hooks/useLotes";
import { useCultivos } from "../hooks/useCultivos";
import { useArboles } from "../hooks/useArboles";
import { loteStyle, cultivoStyle } from "../utils/mapStyles";
import NotificationBell from "./NotificationBell";
import ArbolMarker from "./ArbolMarker";
import "../styles/notification-bell.css";
import "../styles/notification-footer.css";
import "../styles/notification-dropdown.css";
import type { FeatureCollection } from "geojson";

interface MapProps {
  geodata: FeatureCollection | null;
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  focusArbolId?: string | null; // ID del árbol al que hacer zoom
}

const Map: React.FC<MapProps> = ({
  geodata,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  focusArbolId,
}) => {
  void geodata;
  const { lotesData } = useLotes();
  const { cultivosData } = useCultivos();
  const { arbolesData } = useArboles();
  const [selectedArbol, setSelectedArbol] = useState<string | null>(null);

  const fincaUnoPosition: [number, number] = [6.82091, -73.631639];
  
  // Función para obtener el nombre del estado (movida aquí desde el hook)
  const getNombreEstado = (estado?: string) => {
    if (!estado) return "Desconocido";
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  // Componente interno para manejar el zoom al árbol
  const ZoomToArbol: React.FC<{ arbolId: string | null | undefined }> = ({ arbolId }) => {
    const map = useMap();

    useEffect(() => {
      if (arbolId && arbolesData) {
        const arbol = arbolesData.find((a) => a.arbol_id === arbolId);
        if (arbol && arbol.ubicacion) {
          const coordinates = arbol.ubicacion.coordinates;
          if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            // Leaflet usa [lat, lng], GeoJSON usa [lng, lat]
            const [lng, lat] = coordinates;
            // Hacer zoom animado al árbol con un nivel de zoom alto
            setTimeout(() => {
              map.setView([lat, lng], 20, { 
                animate: true, 
                duration: 1.5,
                easeLinearity: 0.5
              });
            }, 100);
            // Seleccionar el árbol automáticamente
            setSelectedArbol(arbolId);
          }
        }
      }
    }, [arbolId, arbolesData, map]);

    return null;
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", overflow: "hidden" }}>
      <MapContainer
        center={fincaUnoPosition}
        zoom={17}
        style={{ height: "100%", width: "100%", border: "none", outline: "none" }}
      >
            {/* Componente para hacer zoom al árbol seleccionado */}
            <ZoomToArbol arbolId={focusArbolId} />
            
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              maxZoom={20}
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              attribution="© Google"
            />

        {/* Lotes */}
        {lotesData && (
          <GeoJSON
            data={lotesData}
            style={loteStyle}
            onEachFeature={(feature, layer) => {
              const nombre = feature.properties?.nombre || "Lote sin nombre";
              layer.bindPopup(`<b>${nombre}</b>`);
            }}
          />
        )}

        {/* Cultivos */}
        {cultivosData && (
          <GeoJSON
            data={cultivosData}
            style={cultivoStyle}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(feature.properties?.nombre || "Cultivo");
            }}
          />
        )}

        {/* Árboles */}
        {arbolesData &&
          arbolesData.map((a) => (
            <ArbolMarker
              key={a.arbol_id}
              arbol={a}
              selected={selectedArbol}
              onSelect={setSelectedArbol}
              getNombreEstado={getNombreEstado}
            />
          ))}
      </MapContainer>

      {/* Campana */}
      <NotificationBell
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDelete={onDelete}
      />
    </div>
  );
};

export default Map;
