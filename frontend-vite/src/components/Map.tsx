import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { useMap } from "react-leaflet/hooks";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

const Map = () => {
  const [geodata, setGeoData] = useState(null);
  const mapRef = useRef<L.Map | null>(null);
  const position: [number, number] = [6.20018, -75.57843];
const cacaoIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/7387/7387376.png", 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})
  useEffect(() => {
    fetch("/data/eafit_example.geojson")
    .then((res) => res.json())
    .then((data) => setGeoData(data))
    .catch((err) => console.error("Error al cargar GeoJSON", err))
  }, [])
  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h4
          style={{
            margin: "20px 0",
            textAlign: "center",
            color: "black",
          }}
        >
          Mapa General
        </h4>

        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          ref={mapRef}
          style={{
            height: "calc(100vh - 100px)",
            width: "95%",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={cacaoIcon}>
            <Popup>
              Finca 1 🌱
            </Popup>
          </Marker>
          {geodata && <GeoJSON data={geodata} />}
        </MapContainer>
      </div>
    </>
  );
};

export default Map;
