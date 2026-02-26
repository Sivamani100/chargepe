import { useState } from "react";
import { SearchNormal1, Filter, Flash } from "iconsax-react";
import StationCard from "@/components/stations/StationCard";
import { mockStations } from "@/lib/mock-stations";

const filters = ["All", "CCS2", "Type 2", "CHAdeMO"];

const Explore = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = mockStations.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" || s.connector_type === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-heading text-foreground font-extrabold mb-4">
          <Flash size={22} variant="Bold" color="hsl(var(--primary))" className="inline mr-1" />
          Explore Stations
        </h1>

        {/* Search */}
        <div className="brutal-card flex items-center gap-3 px-3 py-2">
          <SearchNormal1 size={20} color="hsl(var(--muted-foreground))" />
          <input
            type="text"
            placeholder="Search station or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-muted-foreground"
          />
          <button className="p-1.5 rounded-lg bg-primary/20">
            <Filter size={18} color="hsl(var(--primary))" />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 text-caption font-bold rounded-lg border-brutal whitespace-nowrap transition-all ${
              activeFilter === f
                ? "bg-primary text-primary-foreground shadow-brutal"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4 space-y-3 pb-6">
        <p className="text-caption text-muted-foreground">
          {filtered.length} station{filtered.length !== 1 ? "s" : ""} found
        </p>
        {filtered.map((station) => (
          <StationCard key={station.id} {...station} />
        ))}
        {filtered.length === 0 && (
          <div className="brutal-card p-8 text-center">
            <p className="text-subheading text-muted-foreground">No stations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
