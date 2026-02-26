import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flash, Location, Add, Map1 } from "iconsax-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AddStation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setForm((f) => ({
            ...f,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast.success("Location detected! 📍");
        },
        (error) => {
          toast.error("Could not get location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lat = 12.9716 - (y - rect.height / 2) * 0.01; // Rough conversion for demo
    const lng = 77.5946 + (x - rect.width / 2) * 0.01; // Rough conversion for demo
    setSelectedLocation({ lat, lng });
    setForm((f) => ({
      ...f,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
    setShowMapPicker(false);
  };

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
        <h1 className="text-subheading text-foreground font-bold">Add Charging Station - ChargePe</h1>
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

        <div className="brutal-card p-3">
          <label className="text-caption text-muted-foreground block mb-1">Station Location *</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="flex-1 brutal-card p-3 text-left interactive-scale"
            >
              <div className="flex items-center gap-2">
                <Map1 size={16} color="hsl(var(--primary))" />
                <div>
                  {selectedLocation ? (
                    <span className="text-body text-foreground">
                      📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-caption text-muted-foreground">
                      Click map to set location
                    </span>
                  )}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="flex-1 brutal-card-accent p-3 text-left interactive-scale"
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "hsl(var(--accent))",
                    border: "3px solid #fff",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px hsl(var(--accent))",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>⚡</span>
                </div>
                <span className="text-body text-accent-foreground">
                  Use current location
                </span>
              </div>
            </button>
          </div>
          {selectedLocation && (
            <div className="mt-2 p-2 bg-accent/10 border border-border">
              <p className="text-caption text-muted-foreground">
                📍 Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
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
                className={`px-3 py-1.5 text-caption font-bold border border-border ${
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
      
      {showMapPicker && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="brutal-card p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subheading text-foreground font-bold">Select Location</h3>
              <button
                onClick={() => setShowMapPicker(false)}
                className="p-2 brutal-card interactive-scale"
              >
                <ArrowLeft size={20} color="hsl(var(--foreground))" />
              </button>
            </div>
            <div 
              className="w-full h-64 bg-card border border-border cursor-crosshair relative"
              onClick={handleMapClick}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-8 h-8 bg-primary/20 brutal-card flex items-center justify-center mb-2">
                    <Location size={20} color="hsl(var(--primary))" />
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Click anywhere on the map
                  </p>
                  <p className="text-body text-foreground font-bold">
                    {selectedLocation ? 
                      `📍 ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}` : 
                      "No location selected"
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowMapPicker(false)}
                className="flex-1 brutal-btn bg-card text-foreground py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMapPicker(false)}
                className="flex-1 brutal-btn bg-primary text-primary-foreground py-2"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStation;
