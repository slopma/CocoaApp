// src/components/Map.tsx
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  Marker,
  useMap,
} from "react-leaflet";
import { useEffect, useState, useCallback } from "react";
import { useLotes } from "../hooks/useLotes";
import { useCultivos } from "../hooks/useCultivos";
import { useArboles } from "../hooks/useArboles";
import { loteStyle, cultivoStyle } from "../utils/mapStyles";
import { ArbolIcon, getIconForEstado } from "../utils/mapIcons";
import { Legend } from "./Legend";
import { getFrutoOffset } from "../utils/frutoOffset";
import type { Arbol } from "../types";
import L from "leaflet";
import NotificationBell from "./NotificationBell";

import "../components/NotificationBell.css";

const { BaseLayer } = LayersControl;

/**
 * Observador que vive DENTRO de MapContainer (usa useMap)
 * - Detecta cuando .leaflet-control-layers aparece/ cambia clase
 * - Llama onChange(open, bellTopPx) con la posición calculada en px (relativo al contenedor del mapa)
 */
const LayersControlObserver: React.FC<{
  onChange: (open: boolean, bellTopPx: number) => void;
  defaultTopPx?: number;
}> = ({ onChange, defaultTopPx = 70 }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    let attrObserver: MutationObserver | null = null;
    let listObserver: MutationObserver | null = null;

    const attachToControl = (controlEl: Element) => {
      const update = () => {
        const isOpen = controlEl.classList.contains("leaflet-control-layers-expanded");
        if (isOpen) {
          const controlRect = controlEl.getBoundingClientRect();
          const mapRect = container.getBoundingClientRect();
          // top relative to the map container
          const topPx = Math.max(controlRect.bottom - mapRect.top + 8, defaultTopPx);
          onChange(true, topPx);
        } else {
          onChange(false, defaultTopPx);
        }
      };

      // observe class changes
      attrObserver = new MutationObserver(update);
      attrObserver.observe(controlEl, { attributes: true, attributeFilter: ["class"] });

      // initial check
      update();
    };

    // Try to find control immediately
    const tryFind = () => container.querySelector(".leaflet-control-layers");
    const found = tryFind();
    if (found) {
      attachToControl(found);
    } else {
      // if not found yet, observe children until it's inserted
      listObserver = new MutationObserver(() => {
        const c = tryFind();
        if (c) {
          attachToControl(c);
          if (listObserver) {
            listObserver.disconnect();
            listObserver = null;
          }
        }
      });
      listObserver.observe(container, { childList: true, subtree: true });
    }

    return () => {
      if (attrObserver) attrObserver.disconnect();
      if (listObserver) listObserver.disconnect();
    };
  }, [map, onChange, defaultTopPx]);

  return null;
};

const FitToBounds = ({ data }: { data: GeoJSON.FeatureCollection }) => {
  const map = useMap();
  useEffect(() => {
    if (data && data.features?.length > 0) {
      const layer = L.geoJSON(data);
      map.fitBounds(layer.getBounds());
    }
  }, [data, map]);
  return null;
};

interface MapProps {
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const Map: React.FC<MapProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const { lotesData } = useLotes();
  const { cultivosData } = useCultivos();
  const { arbolesData } = useArboles();
  const [selectedArbol, setSelectedArbol] = useState<Arbol | null>(null);

  // estado para la posición vertical (px) de la campana
  const [bellTopPx, setBellTopPx] = useState<number>(70);

  const position: [number, number] = [6.20018, -75.57843];

  const handleLayersChange = useCallback((open: boolean, topPx: number) => {
    setBellTopPx(topPx);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Contenedor padre */}
      <div style={{ height: "100%", width: "100%", position: "relative" }}>
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
          <LayersControl position="topright">
            <BaseLayer name="🛰️ Esri Satélite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            </BaseLayer>
            <BaseLayer name="🗺️ Calles">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </BaseLayer>
            <BaseLayer checked name="🌐 Híbrida">
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                maxZoom={20}
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                attribution="© Google"
              />
            </BaseLayer>
          </LayersControl>

          {/* Observer vive dentro del MapContainer */}
          <LayersControlObserver onChange={handleLayersChange} />

          {/* Lotes */}
          {lotesData && (
            <>
              <GeoJSON data={lotesData} style={loteStyle} />
              <FitToBounds data={lotesData} />
            </>
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
            arbolesData.map((a) => {
              const coords = a.ubicacion?.coordinates;
              if (!coords) return null;
              return (
                <Marker
                  key={a.arbol_id}
                  position={[coords[1], coords[0]]}
                  icon={ArbolIcon}
                  eventHandlers={{
                    click: () => setSelectedArbol(a),
                  }}
                />
              );
            })}

          {/* Frutos */}
          {selectedArbol &&
            Array.isArray(selectedArbol.frutos) &&
            selectedArbol.frutos.map((fr) => {
              const coords = selectedArbol.ubicacion?.coordinates;
              if (!coords) return null;
              const [offsetLat, offsetLng] = getFrutoOffset(fr.fruto_id);

              return (
                <Marker
                  key={fr.fruto_id}
                  position={[coords[1] + offsetLat, coords[0] + offsetLng]}
                  icon={getIconForEstado(fr.estado_cacao_id)}
                />
              );
            })}
        </MapContainer>

        {/* Campana: colocada fuera del canvas del mapa y posicionada dinámicamente */}
        <div
          className="notification-bell-container"
          style={{
            position: "absolute",
            top: `${bellTopPx}px`,
            right: 10,
            zIndex: 2000,
            transition: "top 0.25s ease",
          }}
        >
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDelete={onDelete}
          />
        </div>

        {/* Leyenda */}
        <Legend />
      </div>
    </div>
  );
};

export default Map;
