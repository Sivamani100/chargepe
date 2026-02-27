import { useState, useMemo } from "react";
import { RealTimeStation } from "./useRealTimeStation";

export interface SearchFilters {
  query: string;
  connectorTypes: string[];
  minPower: number;
  maxPower: number;
  minPrice: number;
  maxPrice: number;
  availableOnly: boolean;
  maxDistance: number;
  amenities: string[];
  rating: number;
  sortBy: "distance" | "price" | "rating" | "availability";
  sortOrder: "asc" | "desc";
}

export interface SearchLocation {
  latitude: number;
  longitude: number;
}

export const useAdvancedSearch = (stations: RealTimeStation[], userLocation?: SearchLocation) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    connectorTypes: [],
    minPower: 0,
    maxPower: 350,
    minPrice: 0,
    maxPrice: 50,
    availableOnly: false,
    maxDistance: 50,
    amenities: [],
    rating: 0,
    sortBy: "distance",
    sortOrder: "asc",
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredStations = useMemo(() => {
    let filtered = stations.filter(station => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesName = station.name.toLowerCase().includes(query);
        const matchesAddress = station.address.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress) return false;
      }

      // Connector types
      if (filters.connectorTypes.length > 0) {
        if (!filters.connectorTypes.includes(station.connector_type)) return false;
      }

      // Power range
      if (station.power_output_kw < filters.minPower || station.power_output_kw > filters.maxPower) {
        return false;
      }

      // Price range
      if (station.price_per_kwh < filters.minPrice || station.price_per_kwh > filters.maxPrice) {
        return false;
      }

      // Available only
      if (filters.availableOnly && station.live_available_slots === 0) {
        return false;
      }

      // Rating
      if (station.rating < filters.rating) {
        return false;
      }

      return true;
    });

    // Add distance if user location is available
    if (userLocation) {
      filtered = filtered.map(station => ({
        ...station,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          station.latitude,
          station.longitude
        ),
      }));
    }

    // Filter by distance
    if (userLocation && filters.maxDistance > 0) {
      filtered = filtered.filter(station => 
        (station as any).distance <= filters.maxDistance
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (filters.sortBy) {
        case "distance":
          aValue = (a as any).distance || 0;
          bValue = (b as any).distance || 0;
          break;
        case "price":
          aValue = a.price_per_kwh;
          bValue = b.price_per_kwh;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "availability":
          aValue = a.live_available_slots;
          bValue = b.live_available_slots;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [stations, filters, userLocation]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      query: "",
      connectorTypes: [],
      minPower: 0,
      maxPower: 350,
      minPrice: 0,
      maxPrice: 50,
      availableOnly: false,
      maxDistance: 50,
      amenities: [],
      rating: 0,
      sortBy: "distance",
      sortOrder: "asc",
    });
  };

  const connectorTypeOptions = [
    { value: "CCS2", label: "CCS2" },
    { value: "Type 2", label: "Type 2" },
    { value: "CHAdeMO", label: "CHAdeMO" },
    { value: "Tesla", label: "Tesla" },
    { value: "GB/T", label: "GB/T" },
  ];

  const amenityOptions = [
    { value: "wifi", label: "WiFi" },
    { value: "restroom", label: "Restroom" },
    { value: "food", label: "Food & Drinks" },
    { value: "shopping", label: "Shopping" },
    { value: "parking", label: "Parking" },
    { value: "shelter", label: "Shelter" },
    { value: "security", label: "24/7 Security" },
  ];

  const sortByOptions = [
    { value: "distance", label: "Distance" },
    { value: "price", label: "Price (kWh)" },
    { value: "rating", label: "Rating" },
    { value: "availability", label: "Available Slots" },
  ];

  return {
    filters,
    filteredStations,
    updateFilter,
    resetFilters,
    connectorTypeOptions,
    amenityOptions,
    sortByOptions,
  };
};
