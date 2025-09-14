import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import IconDropdown from "../assets/Dropdown.png";
import IconExpand from "../assets/Expand.png";
// Iconos por estado
import CacaoInmaduro from "../assets/Cacaos/Caco-Inmaduro.png";
import CacaoTransicion from "../assets/Cacaos/Cacao-en-Transición.png";
import CacaoMaduro from "../assets/Cacaos/Cacao-maduro.png";
import CacaoEnfermo from "../assets/Cacaos/Cacao-Enfermo.png";

const { BaseLayer } = LayersControl;

const Map = ({ geodata }) => {
  const [lotsData, setLotsData] = useState<any>(null);
  const [readingsData, setReadingsData] = useState<any>(null);
  const [legendCollapsed, setLegendCollapsed] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);
  const position: [number, number] = [6.20018, -75.57843];

  useEffect(() => {
    // Usar geodata si se pasa como prop, sino cargar desde archivo
    if (geodata) {
      setLotsData(geodata);
    } else {
      fetch("/data/lotes.geojson")
        .then((res) => res.json())
        .then((data) => setLotsData(data))
        .catch((err) => console.error("Error al cargar lotes.geojson", err));
    }

    fetch("/data/readings.geojson")
      .then((res) => res.json())
      .then((data) => setReadingsData(data))
      .catch((err) => console.error("Error al cargar readings.geojson", err));
  }, [geodata]);

  // Deshabilitar scroll de la página mientras este mapa está visible
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (lotsData && mapRef.current) {
      const layer = L.geoJSON(lotsData);
      mapRef.current.fitBounds(layer.getBounds());
    }
  }, [lotsData]);

  // Estilo de polígonos (verde brillante) similar a la imagen
  const exactGreenStyle = () => ({
    color: "#ffffff",
    weight: 1.5,
    fillColor: "#ffffff",
    fillOpacity: 0.3,
  });

  // Icono según estado
  const estadoToIconUrl: Record<string, string> = {
    inmaduro: CacaoInmaduro,
    transicion: CacaoTransicion,
    maduro: CacaoMaduro,
    enfermo: CacaoEnfermo,
  };

  const getIconForEstado = (estadoRaw: string | undefined) => {
    const key = String(estadoRaw || "inmaduro")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
    const url = estadoToIconUrl[key] || CacaoInmaduro;
    return L.icon({
      iconUrl: url,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
      className: "cacao-icon",
    });
  };

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const estado = feature?.properties?.estado as string | undefined;
    return L.marker(latlng, { icon: getIconForEstado(estado) });
  };

  // Popups: mostrar nombre de zona en polígonos
  const onEachLot = (feature: any, layer: L.Layer) => {
    if (!feature?.properties) return;
    const lote = feature.properties.Lote || feature.properties.lote || "Zona";
    const area = feature.properties.Area || feature.properties.area;

    layer.bindPopup(`
      <div style="min-width: 200px; text-align: center">
        <div style="font-weight:700;color:#2e7d32">${lote}</div>
        ${area ? `<div style=\"margin-top:2px;font-size:12px;color:#777\">Área: ${area}</div>` : ""}
      </div>
    `);
  };

  // Popups: mostrar datos de lectura en puntos
  const onEachReading = (feature: any, layer: L.Layer) => {
    const p = feature?.properties || {};
    const lote = p.lote_id || "-";
    const fecha = p.fecha || "-";
    const estado = p.estado || "-";
    const cap =
      p.capacitancia != null ? Number(p.capacitancia).toFixed(2) : "-";
    const volt = p.voltaje != null ? Number(p.voltaje).toFixed(3) : "-";
    const raw = p.raw != null ? p.raw : "-";
      
    layer.bindPopup(`
      <div style="min-width: 220px">
        <div style="font-weight: 700; margin-bottom: 6px">Lectura de ${lote}</div>
        <div style="font-size: 12px; color: #555">${fecha}</div>
        <div style="margin-top: 8px; font-size: 13px">
          <div>Capacitancia: <strong>${cap}</strong></div>
          <div>Voltaje: <strong>${volt}</strong></div>
          <div>Raw: <strong>${raw}</strong></div>
          <div>Estado: <strong>${estado}</strong></div>
        </div>
      </div>
    `);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        overflow: "hidden",
        paddingBottom: "12px",
      }}
    >
      <h2
        style={{
          margin: "15px 0", 
          textAlign: "center", 
          color: "#2C3E50",
          fontSize: "24px",
          fontWeight: "600",
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        🌱 Monitor de Cultivos
      </h2>

      {/* Contenedor del mapa con posición relativa - CAMBIO CLAVE */}
      <div style={{
        position: "relative", // ✅ Contenedor relativo
        height: "100%",
        flex: "1 1 auto",
        width: "96%",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        border: "2px solid rgba(255,255,255,0.3)",
        overflow: "hidden",
        margin: "0 auto",
      }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{
            height: "100%",
            width: "100%", // ✅ 100% del contenedor padre
          }}
          ref={mapRef}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="🛰️ Satelital">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
                maxZoom={19}
              />
            </BaseLayer>

            <BaseLayer name="🗺️ Calles">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </BaseLayer>

            <BaseLayer name="🌐 Híbrida">
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                maxZoom={20}
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                attribution="© Google"
              />
            </BaseLayer>
          </LayersControl>

          {lotsData && (
            <GeoJSON data={lotsData} style={exactGreenStyle} onEachFeature={onEachLot} />
          )}

          {readingsData && (
            <GeoJSON data={readingsData} pointToLayer={pointToLayer} onEachFeature={onEachReading} />
          )}
        </MapContainer>

        {/* Leyenda SIEMPRE dentro del mapa - 5px del borde */}
        <div
          style={{
            position: "absolute",
            bottom: "80px", // ✅ 5px del borde inferior del mapa
            left: "10px",   // ✅ 5px del borde izquierdo del mapa
            background: "rgba(255, 255, 255, 0.95)",
            padding: legendCollapsed ? "12px" : "16px",
            borderRadius: "12px",
            fontSize: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            zIndex: 1000,
            border: "1px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            transition: "all 180ms ease-in-out",
            width: legendCollapsed ? "140px" : "240px", // ✅ Reducido para móviles
            maxWidth: "calc(100% - 20px)", // ✅ Nunca más ancho que el contenedor
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: legendCollapsed ? 0 : "12px" 
          }}>
            <div style={{ 
              fontWeight: 700, 
              color: "#2C3E50", 
              fontSize: legendCollapsed ? "11px" : "13px" // ✅ Ligeramente más pequeño
            }}>
              Estados del Cacao:
            </div>
            <button
              onClick={() => setLegendCollapsed(v => !v)}
              aria-label={legendCollapsed ? "Expandir leyenda" : "Colapsar leyenda"}
              style={{
                border: "none",
                background: "transparent",
                color: "inherit",
                width: 24,
                height: 24,
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 6,
              }}
            >
              <img 
                src={legendCollapsed ? IconExpand : IconDropdown} 
                alt={legendCollapsed ? "Expandir" : "Colapsar"} 
                style={{ width: 14, height: 14 }} 
              />
            </button>
          </div>
          
          {!legendCollapsed && (
            <div style={{ paddingTop: "4px" }}>
              <div style={{ 
                color: "#10259f", 
                fontWeight: 600, 
                marginBottom: "8px", // ✅ Reducido para que quepa mejor
                padding: "3px 6px", // ✅ Padding más compacto
                borderRadius: "4px",
                backgroundColor: "rgba(16, 37, 159, 0.1)",
                fontSize: "11px" // ✅ Texto más pequeño
              }}>
                🟦 Inmaduro
              </div>
              <div style={{ 
                color: "#9f9a10", 
                fontWeight: 600, 
                marginBottom: "8px",
                padding: "3px 6px",
                borderRadius: "4px",
                backgroundColor: "rgba(159, 154, 16, 0.1)",
                fontSize: "11px"
              }}>
                🟨 Transición
              </div>
              <div style={{ 
                color: "#259f10", 
                fontWeight: 600, 
                marginBottom: "8px",
                padding: "3px 6px",
                borderRadius: "4px",
                backgroundColor: "rgba(37, 159, 16, 0.1)",
                fontSize: "11px"
              }}>
                🟩 Maduro
              </div>
              <div style={{ 
                color: "#9f1028", 
                fontWeight: 600,
                padding: "3px 6px",
                borderRadius: "4px",
                backgroundColor: "rgba(159, 16, 40, 0.1)",
                fontSize: "11px"
              }}>
                🟥 Enfermo
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
