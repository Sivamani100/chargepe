import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  available_slots: number;
  total_slots: number;
}

const statusColors: Record<string, string> = {
  available: "#00FF9C",
  low: "#FF9800",
  busy: "#FF3B3B",
  offline: "#666666",
};

const createMarkerIcon = (status: string) => {
  const color = statusColors[status] || "#666";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 10px ${color}80;
      display: flex; align-items: center; justify-content: center;
    "><span style="font-size: 12px;">⚡</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface MapViewProps {
  stations: Station[];
}

const MapView = ({ stations }: MapViewProps) => {
  const center: [number, number] = [12.9716, 77.5946];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={createMarkerIcon(station.status)}
        >
          <Popup>
            <div className="text-sm font-bold">{station.name}</div>
            <div className="text-xs">
              {station.available_slots}/{station.total_slots} slots
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
