import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

const { BaseLayer } = LayersControl;

const Map = () => {
  const [geodata, setGeoData] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const position: [number, number] = [6.20018, -75.57843];

  useEffect(() => {
    fetch("/data/lotes.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error al cargar GeoJSON", err));
  }, []);

  useEffect(() => {
    if (geodata && mapRef.current) {
      const layer = L.geoJSON(geodata);
      mapRef.current.fitBounds(layer.getBounds());
    }
  }, [geodata]);

  const getStyle = (feature: any) => {
    let fillColor = "#E0E0E0";
    let borderColor = "#2E2E2E";
    let weight = 2;
    
    switch (feature?.properties?.Estado) {
      case "Inmaduro":
        fillColor = "#4FC3F7"; // Azul claro - crecimiento inicial
        break;
      case "Transicion":
        fillColor = "#FF9800"; // Naranja - en desarrollo
        break;
      case "Maduro":
        fillColor = "#8BC34A"; // Verde - listo para cosecha
        break;
      case "Enfermo":
        fillColor = "#F44336"; // Rojo - requiere atención urgente
        borderColor = "#B71C1C"; // Borde más oscuro para alertar
        weight = 3; // Borde más grueso para destacar
        break;
      default:
        fillColor = "#E0E0E0"; // Gris - sin estado definido
    }
    
    return {
      color: borderColor,
      weight: weight,
      fillColor: fillColor,
      fillOpacity: 0.75,
      dashArray: feature?.properties?.Estado ? '' : '5, 5'
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const estado = feature.properties.Estado || "Sin estado";
      const lote = feature.properties.Lote || "Sin nombre";
      
      // Emoji y estilo según el estado
      const getStateInfo = (estado: string) => {
        switch (estado) {
          case "Inmaduro": 
            return { emoji: "🌱", color: "#4FC3F7", description: "En crecimiento inicial" };
          case "Transicion": 
            return { emoji: "🌿", color: "#FF9800", description: "Desarrollándose" };
          case "Maduro": 
            return { emoji: "✅", color: "#8BC34A", description: "Listo para cosecha" };
          case "Enfermo": 
            return { emoji: "🚨", color: "#F44336", description: "Requiere atención médica" };
          default: 
            return { emoji: "❓", color: "#666", description: "Estado no definido" };
        }
      };
      
      const stateInfo = getStateInfo(estado);
      
      layer.bindPopup(`
        <div style="text-align: center; padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: ${stateInfo.color}; font-size: 18px;">
            ${stateInfo.emoji} ${lote}
          </h3>
          <div style="background: ${stateInfo.color}; color: white; padding: 6px 12px; border-radius: 15px; margin: 8px 0; font-weight: 600;">
            ${estado}
          </div>
          <p style="margin: 8px 0 4px 0; font-size: 13px; color: #666; font-style: italic;">
            ${stateInfo.description}
          </p>
          ${feature.properties.Area ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 6px;">📏 Área: ${feature.properties.Area}</p>` : ''}
          ${estado === "Enfermo" ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #F44336; font-weight: 600;">⚠️ Inspección requerida</p>` : ''}
        </div>
      `);

      // Efectos hover mejorados
      layer.on({
        mouseover: function (e) {
          const layer = e.target;
          layer.setStyle({
            weight: estado === "Enfermo" ? 4 : 3,
            fillOpacity: 0.9,
            color: estado === "Enfermo" ? "#B71C1C" : "#1A1A1A"
          });
        },
        mouseout: function (e) {
          const layer = e.target;
          layer.setStyle(getStyle(feature));
        }
      });
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}
    >
      <h2 style={{ 
        margin: "15px 0", 
        textAlign: "center", 
        color: "#2C3E50",
        fontSize: "24px",
        fontWeight: "600",
        textShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        🌱 Monitor de Cultivos de Cacao
      </h2>

      <MapContainer
        center={position}
        zoom={13}
        style={{
          height: "calc(100vh - 120px)",
          width: "96%",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          border: "2px solid rgba(255,255,255,0.3)"
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

        {geodata && (
          <GeoJSON 
            data={geodata} 
            style={getStyle} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>

      {/* Leyenda actualizada */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '15px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        border: '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          marginBottom: '12px', 
          fontWeight: 'bold', 
          color: '#2C3E50',
          fontSize: '14px',
          textAlign: 'center',
          borderBottom: '2px solid #3498DB',
          paddingBottom: '6px'
        }}>
          🌱 Estados del Cacao
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '18px', height: '18px', backgroundColor: '#4FC3F7', marginRight: '10px', borderRadius: '3px', border: '1px solid #29B6F6' }}></div>
          <span style={{ color: '#2C3E50' }}>🌱 Inmaduro</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '18px', height: '18px', backgroundColor: '#FF9800', marginRight: '10px', borderRadius: '3px', border: '1px solid #F57C00' }}></div>
          <span style={{ color: '#2C3E50' }}>🌿 Transición</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '18px', height: '18px', backgroundColor: '#8BC34A', marginRight: '10px', borderRadius: '3px', border: '1px solid #689F38' }}></div>
          <span style={{ color: '#2C3E50' }}>✅ Maduro</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '18px', height: '18px', backgroundColor: '#F44336', marginRight: '10px', borderRadius: '3px', border: '2px solid #B71C1C' }}></div>
          <span style={{ color: '#F44336', fontWeight: 'bold' }}>🚨 Enfermo</span>
        </div>
      </div>
    </div>
  );
};

export default Map;