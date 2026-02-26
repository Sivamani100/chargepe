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

interface MapViewProps {
  stations: Station[];
}

const statusColors: Record<string, string> = {
  available: "#00FF9C",
  low: "#FF9800",
  busy: "#FF3B3B",
  offline: "#666666",
};

const MapView = ({ stations }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const MapError = () => (
    <div style={{
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100%", 
      background: "#f0f0f0",
      color: "#333",
      fontFamily: "'Open Sans', sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ marginBottom: "16px" }}>Map Loading Error</h3>
        <p>Unable to load map. Please check your connection.</p>
        <p style={{ fontSize: "48px" }}>🗺️</p>
      </div>
    </div>
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initializeMap = (centerLat: number, centerLng: number) => {
      try {
        const map = L.map(mapRef.current!, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://osm.org">OSM</a>',
          errorTileUrl: ""
        }).addTo(map);

        // Add user location marker
        const userIcon = L.divIcon({
          className: "user-marker",
          html: `<div style="
            width: 32px; height: 32px;
            background: #3B82F6;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 15px #3B82F680;
            display: flex; align-items: center; justify-content: center;
          "><span style="font-size: 14px;">📍</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([centerLat, centerLng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>Your Location</b><br>You are here!");

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
      } catch (error) {
        console.error("Map initialization error:", error);
        if (mapRef.current) {
          mapRef.current.innerHTML = "";
        }
      }
    };

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          initializeMap(latitude, longitude);
        },
        (error) => {
          console.warn("Could not get user location, using default:", error);
          // Fallback to Bangalore coordinates
          initializeMap(12.9716, 77.5946);
        }
      );
    } else {
      // Fallback if geolocation is not supported
      initializeMap(12.9716, 77.5946);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stations]);

  return (
    <>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      {mapRef.current && mapRef.current.innerHTML === "" && <MapError />}
    </>
  );
};

export default MapView;
