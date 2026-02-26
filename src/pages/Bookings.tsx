import { Calendar, Flash, TickCircle, CloseCircle } from "iconsax-react";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const statusStyles: Record<string, { icon: any; class: string }> = {
  confirmed: { icon: Flash, class: "text-primary" },
  completed: { icon: TickCircle, class: "text-accent" },
  cancelled: { icon: CloseCircle, class: "text-destructive" },
  pending: { icon: Flash, class: "text-warning" },
};

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useBookings();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8 text-center">
          <p className="text-body text-muted-foreground mb-4">Sign in to view your bookings</p>
          <button onClick={() => navigate("/auth")} className="brutal-btn bg-primary text-primary-foreground px-6 py-2 font-bold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-heading text-foreground font-extrabold flex items-center gap-2">
          <Calendar size={22} variant="Bold" color="hsl(var(--primary))" />
          My Bookings
        </h1>
      </header>

      <div className="px-4 space-y-3 pb-6">
        {isLoading ? (
          <div className="brutal-card p-8 text-center text-muted-foreground">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="brutal-card p-8 text-center">
            <p className="text-body text-muted-foreground">No bookings yet</p>
            <button onClick={() => navigate("/explore")} className="mt-3 brutal-btn bg-primary text-primary-foreground px-4 py-2 text-caption font-bold">
              Find a Station
            </button>
          </div>
        ) : (
          bookings.map((booking: any) => {
            const st = statusStyles[booking.status || "pending"] || statusStyles.pending;
            const Icon = st.icon;
            const stationName = booking.charging_stations?.name || "Station";
            return (
              <div key={booking.id} className="brutal-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-body text-foreground font-bold">{stationName}</h3>
                  <div className={`flex items-center gap-1 ${st.class}`}>
                    <Icon size={16} variant="Bold" color="currentColor" />
                    <span className="text-caption font-bold capitalize">{booking.status}</span>
                  </div>
                </div>
                <p className="text-caption text-muted-foreground">
                  {format(new Date(booking.start_time), "MMM dd, yyyy")} • {format(new Date(booking.start_time), "h:mm a")} - {format(new Date(booking.end_time), "h:mm a")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-body text-primary font-bold">₹{booking.amount}</span>
                  <span className="text-caption text-muted-foreground">{booking.duration_minutes} min</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Bookings;
