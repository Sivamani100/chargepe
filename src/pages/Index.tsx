import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchNormal1, Notification, Flash, GpsSlash, ArrowRight2, Sun1, Moon, Add } from "iconsax-react";
import StationCard from "@/components/stations/StationCard";
import MapView from "@/components/map/MapView";
import { useStations } from "@/hooks/useStations";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const { data: stations = [], isLoading } = useStations();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nearbyStations = stations.filter((s) => s.status !== "offline").slice(0, 3);

  return (
    <div className="min-h-screen bg-background animate-slide-up">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-heading text-foreground font-extrabold tracking-tight">
            <span className="text-foreground neon-glow">CHARGE</span>
            <span className="text-accent neon-glow-accent">PE</span>
          </h1>
          <p className="text-caption text-muted-foreground mt-0.5">
            {profile?.full_name ? `Hey ${profile.full_name} <Flash size={12} color="hsl(var(--accent))" />` : `<Flash size={12} color="hsl(var(--accent))" /> EV Charging Intelligence`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 brutal-card interactive-scale">
            {theme === "dark" ? (
              <Sun1 size={20} color="hsl(var(--foreground))" />
            ) : (
              <Moon size={20} color="hsl(var(--foreground))" />
            )}
          </button>
          <button onClick={() => navigate("/explore")} className="p-2 brutal-card-accent interactive-scale">
            <SearchNormal1 size={20} color="hsl(var(--foreground))" />
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="px-4 mb-4 flex gap-3">
        <div className="flex-1 brutal-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/15 flex items-center justify-center">
            <Flash size={20} variant="Bold" color="hsl(var(--primary))" />
          </div>
          <div>
            <p className="text-heading text-foreground font-bold">{stations.length}</p>
            <p className="text-caption text-muted-foreground">Stations</p>
          </div>
        </div>
        <div className="flex-1 brutal-card-accent p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/15 flex items-center justify-center">
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
          className={`flex-1 py-2 text-body font-bold border border-border transition-all animate-slide-up ${
            viewMode === "map"
              ? "bg-primary text-primary-foreground shadow-brutal"
              : "bg-card text-muted-foreground"
          }`}
        >
          🗺 Map
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 text-body font-bold border border-border transition-all ${
            viewMode === "list"
              ? "bg-primary text-primary-foreground shadow-brutal"
              : "bg-card text-muted-foreground"
          }`}
        >
          📋 List
        </button>
      </div>

      {/* Map or List */}
      {viewMode === "map" && (
        <div className="px-4 mb-4">
          <div className="brutal-card overflow-hidden" style={{ height: 280 }}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Loading map...</div>
            ) : (
              <MapView stations={stations} />
            )}
          </div>
        </div>
      )}

      {/* Nearby Stations */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-subheading text-foreground font-bold">⚡ Stations</h2>
          <button onClick={() => navigate("/explore")} className="flex items-center gap-1 text-caption text-primary font-bold">
            See All <ArrowRight2 size={14} color="currentColor" />
          </button>
        </div>
        {isLoading ? (
          <div className="brutal-card p-8 text-center text-muted-foreground">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="brutal-card p-8 text-center">
            <p className="text-body text-muted-foreground">No stations yet. Be the first to add one!</p>
            <button onClick={() => navigate("/add-station")} className="mt-3 brutal-btn bg-primary text-primary-foreground px-4 py-2 text-caption font-bold">
              <Add size={16} className="inline mr-1" /> Add Station
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(viewMode === "list" ? stations : nearbyStations).map((station) => (
              <StationCard key={station.id} {...station} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {user && (
        <button
          onClick={() => navigate("/add-station")}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-primary text-primary-foreground shadow-brutal flex items-center justify-center border border-border"
        >
          <Add size={28} color="currentColor" />
        </button>
      )}
    </div>
  );
};

export default Index;
