import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flash, Location, Add } from "iconsax-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AddStation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    power_output_kw: "50",
    price_per_kwh: "12",
    connector_type: "CCS2",
    total_slots: "4",
    operating_hours: "24/7",
    contact_info: "",
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      toast.error("Fill in all required fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("charging_stations").insert({
      name: form.name.trim(),
      address: form.address.trim(),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      power_output_kw: parseFloat(form.power_output_kw),
      price_per_kwh: parseFloat(form.price_per_kwh),
      connector_type: form.connector_type,
      total_slots: parseInt(form.total_slots),
      available_slots: parseInt(form.total_slots),
      operating_hours: form.operating_hours,
      contact_info: form.contact_info || null,
      submitted_by: user.id,
      is_approved: false,
      status: "available",
    });
    setLoading(false);
    if (error) {
      toast.error("Failed: " + error.message);
    } else {
      toast.success("Station submitted for approval! ⚡");
      navigate("/");
    }
  };

  const connectorTypes = ["CCS2", "Type 2", "CHAdeMO"];

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 brutal-card">
          <ArrowLeft size={20} color="hsl(var(--foreground))" />
        </button>
        <h1 className="text-subheading text-foreground font-bold">Add Charging Station</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-3">
        <div className="brutal-card p-3">
          <label className="text-caption text-muted-foreground block mb-1">Station Name *</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full bg-transparent outline-none text-body text-foreground"
            placeholder="e.g. Tata Power EV Hub"
          />
        </div>

        <div className="brutal-card p-3">
          <label className="text-caption text-muted-foreground block mb-1">Address *</label>
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full bg-transparent outline-none text-body text-foreground"
            placeholder="e.g. MG Road, Bengaluru"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 brutal-card p-3">
            <label className="text-caption text-muted-foreground block mb-1">Latitude *</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              className="w-full bg-transparent outline-none text-body text-foreground"
              placeholder="12.9716"
            />
          </div>
          <div className="flex-1 brutal-card p-3">
            <label className="text-caption text-muted-foreground block mb-1">Longitude *</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              className="w-full bg-transparent outline-none text-body text-foreground"
              placeholder="77.5946"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 brutal-card p-3">
            <label className="text-caption text-muted-foreground block mb-1">Power (kW)</label>
            <input
              type="number"
              value={form.power_output_kw}
              onChange={(e) => update("power_output_kw", e.target.value)}
              className="w-full bg-transparent outline-none text-body text-foreground"
            />
          </div>
          <div className="flex-1 brutal-card p-3">
            <label className="text-caption text-muted-foreground block mb-1">₹/kWh</label>
            <input
              type="number"
              value={form.price_per_kwh}
              onChange={(e) => update("price_per_kwh", e.target.value)}
              className="w-full bg-transparent outline-none text-body text-foreground"
            />
          </div>
        </div>

        <div className="brutal-card p-3">
          <label className="text-caption text-muted-foreground block mb-2">Connector Type</label>
          <div className="flex gap-2">
            {connectorTypes.map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() => update("connector_type", ct)}
                className={`px-3 py-1.5 text-caption font-bold rounded-xl border border-border ${
                  form.connector_type === ct
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground"
                }`}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 brutal-card p-3">
            <label className="text-caption text-muted-foreground block mb-1">Total Slots</label>
            <input
              type="number"
              value={form.total_slots}
              onChange={(e) => update("total_slots", e.target.value)}
              className="w-full bg-transparent outline-none text-body text-foreground"
            />
          </div>
          <div className="flex-1 brutal-card p-3">
            <label className="text-caption text-muted-foreground block mb-1">Hours</label>
            <input
              value={form.operating_hours}
              onChange={(e) => update("operating_hours", e.target.value)}
              className="w-full bg-transparent outline-none text-body text-foreground"
            />
          </div>
        </div>

        <div className="brutal-card p-3">
          <label className="text-caption text-muted-foreground block mb-1">Contact Info</label>
          <input
            value={form.contact_info}
            onChange={(e) => update("contact_info", e.target.value)}
            className="w-full bg-transparent outline-none text-body text-foreground"
            placeholder="Phone or email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full brutal-btn bg-primary text-primary-foreground py-3 font-bold text-body disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Station for Approval ⚡"}
        </button>
      </form>
    </div>
  );
};

export default AddStation;
