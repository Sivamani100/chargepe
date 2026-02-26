import { Calendar, Flash, TickCircle, CloseCircle } from "iconsax-react";

const mockBookings = [
  { id: "1", station: "Tata Power EV Station", date: "Feb 26, 2026", time: "2:00 PM - 3:30 PM", amount: 180, status: "confirmed" },
  { id: "2", station: "ChargeZone Fast", date: "Feb 24, 2026", time: "10:00 AM - 11:00 AM", amount: 216, status: "completed" },
  { id: "3", station: "EESL Charging Hub", date: "Feb 20, 2026", time: "6:00 PM - 7:00 PM", amount: 168, status: "cancelled" },
];

const statusStyles: Record<string, { icon: any; class: string }> = {
  confirmed: { icon: Flash, class: "text-primary" },
  completed: { icon: TickCircle, class: "text-accent" },
  cancelled: { icon: CloseCircle, class: "text-destructive" },
};

const Bookings = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-heading text-foreground font-extrabold flex items-center gap-2">
          <Calendar size={22} variant="Bold" color="hsl(var(--primary))" />
          My Bookings
        </h1>
      </header>

      <div className="px-4 space-y-3 pb-6">
        {mockBookings.map((booking) => {
          const st = statusStyles[booking.status];
          const Icon = st.icon;
          return (
            <div key={booking.id} className="brutal-card p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-body text-foreground font-bold">{booking.station}</h3>
                <div className={`flex items-center gap-1 ${st.class}`}>
                  <Icon size={16} variant="Bold" color="currentColor" />
                  <span className="text-caption font-bold capitalize">{booking.status}</span>
                </div>
              </div>
              <p className="text-caption text-muted-foreground">{booking.date} • {booking.time}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-body text-primary font-bold">₹{booking.amount}</span>
                {booking.status === "confirmed" && (
                  <button className="brutal-btn bg-primary/10 text-primary px-3 py-1 text-caption font-bold">
                    View QR
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bookings;
