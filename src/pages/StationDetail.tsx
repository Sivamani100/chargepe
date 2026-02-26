import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flash, Star1, Location, Clock, Call, DirectUp } from "iconsax-react";
import { useStation } from "@/hooks/useStations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const StationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: station, isLoading } = useStation(id || "");
  const { user } = useAuth();
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!user) {
      toast.error("Please sign in to book");
      navigate("/auth");
      return;
    }
    if (!station) return;
    setBooking(true);
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      station_id: station.id,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: 60,
      amount: station.price_per_kwh * 10,
      status: "confirmed",
    });
    setBooking(false);
    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      toast.success("Booking confirmed! ⚡");
      navigate("/bookings");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

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
  const statusInfo = statusMap[station.status || "offline"] || statusMap.offline;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 brutal-card">
          <ArrowLeft size={20} color="hsl(var(--foreground))" />
        </button>
        <h1 className="text-subheading text-foreground font-bold flex-1 truncate">{station.name}</h1>
        <span className={`text-caption font-bold px-3 py-1 rounded-xl ${statusInfo.class}`}>
          {statusInfo.label}
        </span>
      </header>

      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <div className="brutal-card p-3 text-center">
          <Flash size={24} variant="Bold" color="hsl(var(--primary))" />
          <p className="text-heading text-foreground font-bold mt-1">{station.power_output_kw}kW</p>
          <p className="text-caption text-muted-foreground">Power Output</p>
        </div>
        <div className="brutal-card-accent p-3 text-center">
          <Star1 size={24} variant="Bold" color="hsl(var(--warning))" />
          <p className="text-heading text-foreground font-bold mt-1">{(station.rating || 0).toFixed(1)}</p>
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

      <div className="px-4 pb-6 flex gap-3">
        <button
          onClick={handleBook}
          disabled={booking || station.status === "offline" || station.status === "busy"}
          className="flex-1 brutal-btn bg-primary text-primary-foreground py-3 font-bold text-body flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Flash size={18} color="currentColor" /> {booking ? "Booking..." : "Book Now"}
        </button>
        <button className="brutal-btn bg-card text-foreground p-3">
          <DirectUp size={22} color="hsl(var(--accent))" />
        </button>
      </div>
    </div>
  );
};

export default StationDetail;
