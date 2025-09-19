import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
} from "react-leaflet";
import { useState } from "react";
import { useLotes } from "../hooks/useLotes";
import { useCultivos } from "../hooks/useCultivos";
import { useArboles } from "../hooks/useArboles";
import { loteStyle, cultivoStyle } from "../utils/mapStyles";
import NotificationBell from "./NotificationBell";
import ArbolMarker from "./ArbolMarker";
import "../components/NotificationBell.css";
import type { FeatureCollection } from "geojson";

const { BaseLayer } = LayersControl;

interface MapProps {
  geodata: FeatureCollection | null;
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const Map: React.FC<MapProps> = ({
  geodata,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  void geodata;
  const { lotesData } = useLotes();
  const { cultivosData } = useCultivos();
  const { arbolesData, getNombreEstado } = useArboles();
  const [selectedArbol, setSelectedArbol] = useState<string | null>(null);
  const [bellTopPx] = useState<number>(70);

  const fincaUnoPosition: [number, number] = [6.82091, -73.631639];

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={fincaUnoPosition}
        zoom={17}
        style={{ height: "100%", width: "100%" }} // 👈 ahora 100% y App controla altura
      >
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
              attribution="&copy; OpenStreetMap"
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
      <div
        className="notification-bell-container"
        style={{ position: "absolute", top: bellTopPx, right: 10, zIndex: 2000 }}
      >
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default Map;
