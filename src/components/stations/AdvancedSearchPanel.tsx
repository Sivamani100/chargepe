import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Zap, DollarSign, Clock, Star } from 'lucide-react';
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch';
import { StationAmenities } from './StationAmenities';

interface AdvancedSearchPanelProps {
  onStationSelect: (station: any) => void;
  className?: string;
}

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({ onStationSelect, className = "" }) => {
  const {
    filters,
    updateFilter,
    filteredStations,
    resetFilters,
    connectorTypeOptions,
    amenityOptions,
    sortByOptions,
  } = useAdvancedSearch();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update filter when search query changes
  useEffect(() => {
    updateFilter('searchQuery', searchQuery);
  }, [searchQuery, updateFilter]);

  // Update filter when sort by changes
  useEffect(() => {
    updateFilter('sortBy', sortBy);
  }, [sortBy, updateFilter]);

  return (
    <div className={`brutal-card p-6 ${className}`}>
      {/* Search Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search stations, locations, or amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-accent rounded-lg">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Price Range ($/kWh)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || 0}
                onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || 50}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
          </div>

          {/* Power Output */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Power (kW)</label>
            <input
              type="number"
              placeholder="Min power"
              value={filters.minPower || 0}
              onChange={(e) => updateFilter('minPower', Number(e.target.value))}
              className="w-full px-2 py-1 border rounded"
            />
          </div>

          {/* Connector Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Connector Types</label>
            <div className="space-y-1">
              {connectorTypeOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.connectorTypes.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter('connectorTypes', [...filters.connectorTypes, option.value]);
                      } else {
                        updateFilter('connectorTypes', filters.connectorTypes.filter(t => t !== option.value));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="space-y-1">
              {amenityOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter('amenities', [...filters.amenities, option.value]);
                      } else {
                        updateFilter('amenities', filters.amenities.filter(a => a !== option.value));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border rounded-lg"
        >
          {sortByOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filteredStations.length} stations found
        </span>
      </div>

      {/* Results */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Searching stations...</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No stations found matching your criteria</p>
          </div>
        ) : (
          filteredStations.map((station) => (
            <div
              key={station.id}
              onClick={() => onStationSelect(station)}
              className="brutal-card p-4 cursor-pointer hover:shadow-brutal transition-all animate-slide-up"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{station.name}</h3>
                  <p className="text-sm text-muted-foreground">{station.address}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{station.rating || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {station.distance ? `${station.distance.toFixed(1)} km` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{station.power_output_kw} kW</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">${station.price_per_kwh}/kWh</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {station.live_available_slots}/{station.total_slots} slots
                  </span>
                </div>
              </div>

              <StationAmenities amenities={station.amenities || []} />

              <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  station.live_available_slots > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {station.live_available_slots > 0 ? 'Available' : 'Full'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {station.connector_type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;
