import { useEffect, useRef } from "react";
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

interface MapViewProps {
  stations: Station[];
}

const MapView = ({ stations }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org">OSM</a>',
    }).addTo(map);

    stations.forEach((station) => {
      const color = statusColors[station.status] || "#666";
      const icon = L.divIcon({
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

      L.marker([station.latitude, station.longitude], { icon })
        .addTo(map)
        .bindPopup(`<b>${station.name}</b><br>${station.available_slots}/${station.total_slots} slots`);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [stations]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
};

export default MapView;
