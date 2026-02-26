import { useNavigate } from "react-router-dom";
import { Flash, Location, Star1 } from "iconsax-react";

interface StationCardProps {
  id: string;
  name: string;
  address: string;
  status: string;
  available_slots: number;
  total_slots: number;
  power_output_kw: number;
  price_per_kwh: number;
  rating: number;
  connector_type: string;
}

const statusMap: Record<string, { label: string; class: string }> = {
  available: { label: "Available", class: "status-available" },
  low: { label: "Low Slots", class: "status-low" },
  busy: { label: "Busy", class: "status-busy" },
  offline: { label: "Offline", class: "status-offline" },
};

const StationCard = ({
  id, name, address, status, available_slots, total_slots,
  power_output_kw, price_per_kwh, rating, connector_type,
}: StationCardProps) => {
  const navigate = useNavigate();
  const statusInfo = statusMap[status] || statusMap.offline;

  return (
    <button
      onClick={() => navigate(`/station/${id}`)}
      className="w-full text-left brutal-card p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-none transition-all animate-slide-up interactive-scale"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-subheading text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <Location size={14} color="currentColor" />
            <span className="text-caption truncate">{address}</span>
          </div>
        </div>
        <span className={`text-caption font-bold px-2 py-1 ${statusInfo.class} animate-pulse-brutal`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-caption">
        <div className="flex items-center gap-1">
          <Flash size={14} color="hsl(var(--primary))" variant="Bold" />
          <span className="text-foreground font-semibold">{power_output_kw}kW</span>
        </div>
        <div className="flex items-center gap-1">
          <Star1 size={14} color="hsl(var(--warning))" variant="Bold" />
          <span className="text-foreground font-semibold">{rating.toFixed(1)}</span>
        </div>
        <span className="text-muted-foreground">{connector_type}</span>
        <span className="ml-auto text-primary font-bold">
          {available_slots}/{total_slots} slots
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-caption text-muted-foreground">₹{price_per_kwh}/kWh</span>
        <span className="text-caption font-bold text-primary brutal-btn bg-primary/10 px-3 py-1">
          Book Now →
        </span>
      </div>
    </button>
  );
};

export default StationCard;
