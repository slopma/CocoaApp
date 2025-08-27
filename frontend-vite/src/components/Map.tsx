import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMap } from "react-leaflet/hooks";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import L from "leaflet";

const Map = () => {
  const mapRef = useRef<L.Map | null>(null);
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
            color: "white",
          }}
        >
          Cocoa App Map
        </h4>

        <MapContainer
          center={[51.505, -0.09]}
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
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </>
  );
};

export default Map;
