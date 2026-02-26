import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flash, Star1, Location, Clock, Call, DirectUp } from "iconsax-react";
import { mockStations } from "@/lib/mock-stations";

const StationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const station = mockStations.find((s) => s.id === id);

  if (!station) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8 text-center">
          <p className="text-heading text-foreground">Station not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 brutal-btn bg-primary text-primary-foreground px-6 py-2 font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusMap: Record<string, { label: string; class: string }> = {
    available: { label: "Available", class: "status-available" },
    low: { label: "Low Slots", class: "status-low" },
    busy: { label: "Busy", class: "status-busy" },
    offline: { label: "Offline", class: "status-offline" },
  };
  const statusInfo = statusMap[station.status] || statusMap.offline;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 brutal-card">
          <ArrowLeft size={20} color="hsl(var(--foreground))" />
        </button>
        <h1 className="text-subheading text-foreground font-bold flex-1 truncate">{station.name}</h1>
        <span className={`text-caption font-bold px-3 py-1 rounded-lg ${statusInfo.class}`}>
          {statusInfo.label}
        </span>
      </header>

      {/* Map Preview */}
      <div className="px-4 mb-4">
        <div className="brutal-card-accent overflow-hidden h-48 flex items-center justify-center bg-card">
          <div className="text-center">
            <Flash size={48} variant="Bold" color="hsl(var(--primary))" />
            <p className="text-caption text-muted-foreground mt-2">Station Location</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <div className="brutal-card p-3 text-center">
          <Flash size={24} variant="Bold" color="hsl(var(--primary))" />
          <p className="text-heading text-foreground font-bold mt-1">{station.power_output_kw}kW</p>
          <p className="text-caption text-muted-foreground">Power Output</p>
        </div>
        <div className="brutal-card-accent p-3 text-center">
          <Star1 size={24} variant="Bold" color="hsl(var(--warning))" />
          <p className="text-heading text-foreground font-bold mt-1">{station.rating.toFixed(1)}</p>
          <p className="text-caption text-muted-foreground">Rating</p>
        </div>
        <div className="brutal-card p-3 text-center">
          <p className="text-heading text-primary font-bold">{station.available_slots}/{station.total_slots}</p>
          <p className="text-caption text-muted-foreground">Available Slots</p>
        </div>
        <div className="brutal-card-accent p-3 text-center">
          <p className="text-heading text-accent font-bold">₹{station.price_per_kwh}</p>
          <p className="text-caption text-muted-foreground">Per kWh</p>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 mb-4">
        <div className="brutal-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Location size={18} color="hsl(var(--muted-foreground))" />
            <span className="text-body text-foreground">{station.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={18} color="hsl(var(--muted-foreground))" />
            <span className="text-body text-foreground">{station.operating_hours}</span>
          </div>
          <div className="flex items-center gap-3">
            <Flash size={18} color="hsl(var(--primary))" />
            <span className="text-body text-foreground">{station.connector_type}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-6 flex gap-3">
        <button className="flex-1 brutal-btn bg-primary text-primary-foreground py-3 font-bold text-body flex items-center justify-center gap-2">
          <Flash size={18} color="currentColor" /> Book Now
        </button>
        <button className="brutal-btn bg-card text-foreground p-3">
          <DirectUp size={22} color="hsl(var(--accent))" />
        </button>
        <button className="brutal-btn bg-card text-foreground p-3">
          <Call size={22} color="hsl(var(--foreground))" />
        </button>
      </div>
    </div>
  );
};

export default StationDetail;
