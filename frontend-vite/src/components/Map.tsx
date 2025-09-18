// src/components/Map.tsx
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect, useState, useCallback } from "react";
import { useLotes } from "../hooks/useLotes";
import { useCultivos } from "../hooks/useCultivos";
import { loteStyle, cultivoStyle } from "../utils/mapStyles";
import { ArbolIcon, getIconForEstado } from "../utils/mapIcons";
import { getFrutoOffset } from "../utils/frutoOffset";
import type { Arbol } from "../types";
import L from "leaflet";
import NotificationBell from "./NotificationBell";
import { supabase } from "../utils/SupabaseClient";
import "../components/NotificationBell.css";

const { BaseLayer } = LayersControl;

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

  const fincaUnoPosition: [number, number] = [6.820910, -73.631639];

  const [bellTopPx, setBellTopPx] = useState<number>(70);
  const [arbolesConFrutos, setArbolesConFrutos] = useState<(Arbol & { frutos: any[] })[]>([]);
  const [selectedArbol, setSelectedArbol] = useState<string | null>(null);

  const handleLayersChange = useCallback((open: boolean, topPx: number) => {
    setBellTopPx(topPx);
  }, []);

  // Estado cacao cacheado
  const [estadosCacao, setEstadosCacao] = useState<{estado_cacao_id: string, nombre: string}[]>([]);

  useEffect(() => {
    const fetchEstados = async () => {
      const { data, error } = await supabase.from("estado_cacao").select("*");
      if (error) console.error("Error fetching estados:", error);
      else setEstadosCacao(data || []);
    };
    fetchEstados();
  }, []);

  // Función auxiliar para obtener el nombre
  const getNombreEstado = (id: string) => {
    return estadosCacao.find(e => e.estado_cacao_id === id)?.nombre || id;
  };


  // Cargar todos los árboles y frutos al inicio
  useEffect(() => {
    const fetchArbolesYFrutos = async () => {
      // Traer todos los árboles
      const { data: arbolData, error: arbolError } = await supabase.from("arbol").select("*");
      if (arbolError || !arbolData) {
        console.error("Error fetching arboles:", arbolError);
        return;
      }

      // Traer todos los frutos
      const { data: frutosData, error: frutosError } = await supabase.from("fruto").select("*");
      if (frutosError || !frutosData) {
        console.error("Error fetching frutos:", frutosError);
      }

      // Asociar frutos a cada árbol
      const arbolesConFrutos = arbolData.map((a: any) => ({
        ...a,
        frutos: frutosData?.filter((f: any) => f.arbol_id === a.arbol_id) || [],
      }));

      setArbolesConFrutos(arbolesConFrutos);
    };

    fetchArbolesYFrutos();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <div style={{ height: "100%", width: "100%", position: "relative" }}>
        <MapContainer center={fincaUnoPosition} zoom={17} style={{ height: "100%", width: "100%" }}>
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
          {arbolesConFrutos.map((a) => {
            if (!a.ubicacion?.coordinates) return null;
            return (
              <Marker
                key={a.arbol_id}
                position={[a.ubicacion.coordinates[1], a.ubicacion.coordinates[0]]}
                icon={ArbolIcon}
                eventHandlers={{
                  click: () => setSelectedArbol(a.arbol_id),
                }}
              >
                {selectedArbol === a.arbol_id && (
                  <Popup>
                    <div>
                      <h4>{a.nombre}</h4>
                      <p>{a.especie}</p>
                      <p>{getNombreEstado(a.estado_cacao_id)}</p>
                      <h5>Frutos:</h5>
                      {a.frutos.length > 0 ? (
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                          <ul style={{ paddingLeft: "20px", margin: 0 }}>
                            {a.frutos.map((fr) => {
                              const nombreEstado = getNombreEstado(fr.estado_cacao_id);
                              const icono = getIconForEstado(nombreEstado);
                              return (
                                <li
                                  key={fr.fruto_id}
                                  style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}
                                >
                                  <img src={icono.options.iconUrl} alt={nombreEstado} style={{ width: 24, height: 24 }} />
                                  <span>
                                    {fr.Especie} - {nombreEstado} 
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                      ) : (
                        <p>Sin frutos registrados</p>
                      )}
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          })}
        </MapContainer>

        {/* Campana */}
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

        
      </div>
    </div>
  );
};

export default Map;
