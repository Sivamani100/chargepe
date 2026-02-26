import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TickCircle, CloseCircle, Trash, People, Flash, Setting2 } from "iconsax-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "stations" | "bookings">("pending");

  const { data: pendingStations = [] } = useQuery({
    queryKey: ["admin-pending-stations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("charging_stations")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: allStations = [] } = useQuery({
    queryKey: ["admin-all-stations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("charging_stations")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, charging_stations(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase
          .from("charging_stations")
          .update({ is_approved: true })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("charging_stations")
          .delete()
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-stations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Updated! ⚡");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8 text-center">
          <p className="text-body text-destructive font-bold mb-4">Access Denied</p>
          <button onClick={() => navigate("/")} className="brutal-btn bg-primary text-primary-foreground px-6 py-2 font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "pending", label: `Pending (${pendingStations.length})` },
    { key: "stations", label: `Stations (${allStations.length})` },
    { key: "bookings", label: `Bookings (${allBookings.length})` },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 brutal-card">
          <ArrowLeft size={20} color="hsl(var(--foreground))" />
        </button>
        <h1 className="text-subheading text-foreground font-bold flex items-center gap-2">
          <Setting2 size={20} color="hsl(var(--primary))" /> Admin
        </h1>
      </header>

      {/* Stats */}
      <div className="px-4 mb-4 flex gap-3">
        <div className="flex-1 brutal-card p-3 text-center">
          <p className="text-heading text-primary font-bold">{allStations.length}</p>
          <p className="text-caption text-muted-foreground">Stations</p>
        </div>
        <div className="flex-1 brutal-card-accent p-3 text-center">
          <p className="text-heading text-accent font-bold">{allBookings.length}</p>
          <p className="text-caption text-muted-foreground">Bookings</p>
        </div>
        <div className="flex-1 brutal-card p-3 text-center">
          <p className="text-heading text-warning font-bold">{pendingStations.length}</p>
          <p className="text-caption text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-caption font-bold rounded-xl border border-border whitespace-nowrap ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-3">
        {tab === "pending" && (
          pendingStations.length === 0 ? (
            <div className="brutal-card p-8 text-center text-muted-foreground">No pending stations</div>
          ) : (
            pendingStations.map((s: any) => (
              <div key={s.id} className="brutal-card p-4">
                <h3 className="text-body text-foreground font-bold">{s.name}</h3>
                <p className="text-caption text-muted-foreground">{s.address}</p>
                <p className="text-caption text-muted-foreground mt-1">
                  {s.power_output_kw}kW • {s.connector_type} • {s.total_slots} slots • ₹{s.price_per_kwh}/kWh
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate({ id: s.id, approve: true })}
                    className="flex-1 brutal-btn bg-accent/15 text-accent py-2 font-bold text-caption flex items-center justify-center gap-1"
                  >
                    <TickCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ id: s.id, approve: false })}
                    className="flex-1 brutal-btn bg-destructive/15 text-destructive py-2 font-bold text-caption flex items-center justify-center gap-1"
                  >
                    <CloseCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {tab === "stations" && (
          allStations.length === 0 ? (
            <div className="brutal-card p-8 text-center text-muted-foreground">No stations</div>
          ) : (
            allStations.map((s: any) => (
              <div key={s.id} className="brutal-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-body text-foreground font-bold">{s.name}</h3>
                    <p className="text-caption text-muted-foreground">{s.address}</p>
                  </div>
                  <span className={`text-caption font-bold px-2 py-0.5 rounded-lg ${s.is_approved ? "bg-accent/15 text-accent" : "bg-warning/15 text-warning"}`}>
                    {s.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
            ))
          )
        )}

        {tab === "bookings" && (
          allBookings.length === 0 ? (
            <div className="brutal-card p-8 text-center text-muted-foreground">No bookings</div>
          ) : (
            allBookings.map((b: any) => (
              <div key={b.id} className="brutal-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-body text-foreground font-bold">{b.charging_stations?.name || "Station"}</h3>
                    <p className="text-caption text-muted-foreground">₹{b.amount} • {b.duration_minutes}min</p>
                  </div>
                  <span className="text-caption font-bold text-primary capitalize">{b.status}</span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
