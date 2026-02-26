import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchNormal1, Notification, Flash, GpsSlash, ArrowRight2 } from "iconsax-react";
import StationCard from "@/components/stations/StationCard";
import { mockStations } from "@/lib/mock-stations";
import MapView from "@/components/map/MapView";

const Index = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const nearbyStations = mockStations.filter((s) => s.status !== "offline").slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-heading text-foreground font-extrabold tracking-tight">
            <span className="text-primary neon-glow">CHARGE</span>
            <span className="text-accent neon-glow-accent">PE</span>
          </h1>
          <p className="text-caption text-muted-foreground mt-0.5">
            ⚡ EV Charging Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/explore")}
            className="p-2 brutal-card-accent"
          >
            <SearchNormal1 size={20} color="hsl(var(--foreground))" />
          </button>
          <button className="p-2 brutal-card relative">
            <Notification size={20} color="hsl(var(--foreground))" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive border-2 border-card" />
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="px-4 mb-4 flex gap-3">
        <div className="flex-1 brutal-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Flash size={20} variant="Bold" color="hsl(var(--primary))" />
          </div>
          <div>
            <p className="text-heading text-foreground font-bold">12</p>
            <p className="text-caption text-muted-foreground">Stations Nearby</p>
          </div>
        </div>
        <div className="flex-1 brutal-card-accent p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <GpsSlash size={20} variant="Bold" color="hsl(var(--accent))" />
          </div>
          <div>
            <p className="text-heading text-foreground font-bold">3km</p>
            <p className="text-caption text-muted-foreground">Radius</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-4 mb-4 flex gap-2">
        <button
          onClick={() => setViewMode("map")}
          className={`flex-1 py-2 text-body font-bold rounded-lg border-brutal transition-all ${
            viewMode === "map"
              ? "bg-primary text-primary-foreground shadow-brutal"
              : "bg-card text-muted-foreground"
          }`}
        >
          🗺 Map View
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 text-body font-bold rounded-lg border-brutal transition-all ${
            viewMode === "list"
              ? "bg-primary text-primary-foreground shadow-brutal"
              : "bg-card text-muted-foreground"
          }`}
        >
          📋 List View
        </button>
      </div>

      {/* Map or List */}
      {viewMode === "map" ? (
        <div className="px-4 mb-4">
          <div className="brutal-card overflow-hidden" style={{ height: 280 }}>
            <MapView stations={mockStations} />
          </div>
        </div>
      ) : null}

      {/* Nearby Stations */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-subheading text-foreground font-bold">
            ⚡ Nearby Stations
          </h2>
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-1 text-caption text-primary font-bold"
          >
            See All <ArrowRight2 size={14} color="currentColor" />
          </button>
        </div>
        <div className="space-y-3">
          {(viewMode === "list" ? mockStations : nearbyStations).map((station) => (
            <StationCard key={station.id} {...station} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
