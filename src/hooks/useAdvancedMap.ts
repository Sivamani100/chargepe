import { useState, useEffect, useMemo, useCallback } from "react";
import { useRealTimeStations } from "./useRealTimeStation";
import { useAuth } from "./useAuth";

export interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number; // 0-1
  count: number;
  average_price: number;
  station_ids: string[];
}

export interface MapLayer {
  id: string;
  name: string;
  type: "heatmap" | "clusters" | "traffic" | "weather" | "construction";
  visible: boolean;
  opacity: number;
  data?: any;
}

export interface MapFilter {
  timeRange: "now" | "today" | "week" | "month";
  stationStatus: "all" | "available" | "busy" | "offline";
  priceRange: [number, number];
  powerRange: [number, number];
  showOnlyFavorites: boolean;
}

export interface TrafficData {
  lat: number;
  lng: number;
  level: "low" | "medium" | "high" | "severe";
  speed: number; // km/h
  incidents: string[];
}

export interface WeatherOverlay {
  lat: number;
  lng: number;
  temperature: number;
  conditions: "clear" | "cloudy" | "rain" | "snow" | "storm";
  humidity: number;
  wind_speed: number;
}

export interface ConstructionAlert {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  start_date: string;
  end_date: string;
  affected_stations: string[];
}

export const useAdvancedMap = () => {
  const { user } = useAuth();
  const { stations } = useRealTimeStations();
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: "heatmap",
      name: "Demand Heatmap",
      type: "heatmap",
      visible: false,
      opacity: 0.6,
    },
    {
      id: "traffic",
      name: "Traffic Conditions",
      type: "traffic",
      visible: false,
      opacity: 0.7,
    },
    {
      id: "weather",
      name: "Weather Overlay",
      type: "weather",
      visible: false,
      opacity: 0.5,
    },
    {
      id: "construction",
      name: "Construction Alerts",
      type: "construction",
      visible: true,
      opacity: 0.8,
    },
  ]);
  
  const [filters, setFilters] = useState<MapFilter>({
    timeRange: "now",
    stationStatus: "all",
    priceRange: [0, 50],
    powerRange: [0, 350],
    showOnlyFavorites: false,
  });

  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherOverlay[]>([]);
  const [constructionAlerts, setConstructionAlerts] = useState<ConstructionAlert[]>([]);
  const [offlineMaps, setOfflineMaps] = useState<string[]>([]);

  // Generate heatmap data based on station demand
  const generateHeatmapData = useCallback(() => {
    const gridSize = 0.01; // Approximately 1km grid
    const grid: Map<string, HeatmapData> = new Map();

    stations.forEach(station => {
      const lat = Math.floor(station.latitude / gridSize) * gridSize;
      const lng = Math.floor(station.longitude / gridSize) * gridSize;
      const key = `${lat},${lng}`;

      const utilizationRate = station.utilization_rate || 0;
      const intensity = Math.min(1, utilizationRate / 100);

      if (grid.has(key)) {
        const existing = grid.get(key)!;
        existing.count += 1;
        existing.intensity = Math.max(existing.intensity, intensity);
        existing.average_price = (existing.average_price + station.price_per_kwh) / 2;
        existing.station_ids.push(station.id);
      } else {
        grid.set(key, {
          lat,
          lng,
          intensity,
          count: 1,
          average_price: station.price_per_kwh,
          station_ids: [station.id],
        });
      }
    });

    setHeatmapData(Array.from(grid.values()));
  }, [stations]);

  // Generate mock traffic data
  const generateTrafficData = useCallback(() => {
    const mockTraffic: TrafficData[] = [
      {
        lat: 12.9716,
        lng: 77.5946,
        level: "high",
        speed: 25,
        incidents: ["Heavy traffic on MG Road"],
      },
      {
        lat: 12.9856,
        lng: 77.6096,
        level: "medium",
        speed: 35,
        incidents: [],
      },
      {
        lat: 12.9576,
        lng: 77.5796,
        level: "low",
        speed: 45,
        incidents: [],
      },
    ];
    setTrafficData(mockTraffic);
  }, []);

  // Generate mock weather data
  const generateWeatherData = useCallback(() => {
    const mockWeather: WeatherOverlay[] = [
      {
        lat: 12.9716,
        lng: 77.5946,
        temperature: 28,
        conditions: "clear",
        humidity: 65,
        wind_speed: 12,
      },
      {
        lat: 12.9856,
        lng: 77.6096,
        temperature: 26,
        conditions: "cloudy",
        humidity: 70,
        wind_speed: 8,
      },
    ];
    setWeatherData(mockWeather);
  }, []);

  // Generate mock construction alerts
  const generateConstructionAlerts = useCallback(() => {
    const mockAlerts: ConstructionAlert[] = [
      {
        id: "const_1",
        lat: 12.9716,
        lng: 77.5946,
        title: "MG Road Construction",
        description: "Lane reduction due to metro construction. Expect delays.",
        severity: "high",
        start_date: "2024-01-01",
        end_date: "2024-03-31",
        affected_stations: stations.slice(0, 2).map(s => s.id),
      },
      {
        id: "const_2",
        lat: 12.9856,
        lng: 77.6096,
        title: "Parking Lot Renovation",
        description: "Limited parking available at nearby stations.",
        severity: "medium",
        start_date: "2024-02-01",
        end_date: "2024-02-15",
        affected_stations: stations.slice(2, 3).map(s => s.id),
      },
    ];
    setConstructionAlerts(mockAlerts);
  }, [stations]);

  // Toggle layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, []);

  // Update layer opacity
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  }, []);

  // Update filters
  const updateFilter = useCallback((key: keyof MapFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Get filtered stations
  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      // Status filter
      if (filters.stationStatus !== "all") {
        if (filters.stationStatus === "available" && station.live_available_slots === 0) return false;
        if (filters.stationStatus === "busy" && station.utilization_rate < 50) return false;
        if (filters.stationStatus === "offline" && station.status !== "offline") return false;
      }

      // Price filter
      if (station.price_per_kwh < filters.priceRange[0] || station.price_per_kwh > filters.priceRange[1]) {
        return false;
      }

      // Power filter
      if (station.power_output_kw < filters.powerRange[0] || station.power_output_kw > filters.powerRange[1]) {
        return false;
      }

      return true;
    });
  }, [stations, filters]);

  // Download offline map
  const downloadOfflineMap = async (area: {
    lat: number;
    lng: number;
    radius: number; // in km
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate offline map download
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mapKey = `${area.lat.toFixed(4)},${area.lng.toFixed(4)},${area.radius}`;
      setOfflineMaps(prev => [...prev, mapKey]);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to download offline map" };
    }
  };

  // Check if offline map is available
  const isOfflineMapAvailable = useCallback((lat: number, lng: number, radius: number = 5) => {
    const mapKey = `${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;
    return offlineMaps.includes(mapKey);
  }, [offlineMaps]);

  // Get optimal charging stations based on multiple factors
  const getOptimalStations = useCallback((
    userLat: number,
    userLng: number,
    preferences: {
      maxDistance: number;
      minPower: number;
      maxPrice: number;
      weightDistance: number;
      weightPrice: number;
      weightAvailability: number;
    }
  ) => {
    const scoredStations = filteredStations.map(station => {
      const distance = calculateDistance(userLat, userLng, station.latitude, station.longitude);
      
      if (distance > preferences.maxDistance) return null;
      
      let score = 0;
      
      // Distance score (lower is better)
      const distanceScore = Math.max(0, 100 - (distance / preferences.maxDistance) * 100);
      score += distanceScore * preferences.weightDistance;
      
      // Price score (lower is better)
      if (station.price_per_kwh <= preferences.maxPrice) {
        const priceScore = Math.max(0, 100 - (station.price_per_kwh / preferences.maxPrice) * 100);
        score += priceScore * preferences.weightPrice;
      }
      
      // Availability score (higher is better)
      const availabilityScore = (station.live_available_slots / station.total_slots) * 100;
      score += availabilityScore * preferences.weightAvailability;
      
      // Power score (higher is better)
      if (station.power_output_kw >= preferences.minPower) {
        const powerScore = Math.min(100, (station.power_output_kw / preferences.minPower) * 50);
        score += powerScore;
      }
      
      return {
        station,
        score,
        distance,
        reasoning: generateReasoning(station, distance, preferences),
      };
    }).filter(Boolean) as Array<{
      station: any;
      score: number;
      distance: number;
      reasoning: string;
    }>;

    return scoredStations.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [filteredStations]);

  // Helper function to calculate distance
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

  // Generate reasoning for station selection
  const generateReasoning = (station: any, distance: number, preferences: any): string => {
    const reasons = [];
    
    if (distance < 2) reasons.push("Very close to your location");
    if (station.live_available_slots > 0) reasons.push(`${station.live_available_slots} slots available`);
    if (station.price_per_kwh < preferences.maxPrice * 0.8) reasons.push("Good pricing");
    if (station.power_output_kw > preferences.minPower * 1.5) reasons.push("Fast charging available");
    if (station.rating > 4.5) reasons.push("Highly rated");
    
    return reasons.length > 0 ? reasons.join(", ") : "Meets your criteria";
  };

  // Initialize data
  useEffect(() => {
    generateHeatmapData();
    generateTrafficData();
    generateWeatherData();
    generateConstructionAlerts();
  }, [generateHeatmapData, generateTrafficData, generateWeatherData, generateConstructionAlerts]);

  return {
    layers,
    filters,
    heatmapData,
    trafficData,
    weatherData,
    constructionAlerts,
    offlineMaps,
    filteredStations,
    toggleLayer,
    updateLayerOpacity,
    updateFilter,
    downloadOfflineMap,
    isOfflineMapAvailable,
    getOptimalStations,
    calculateDistance,
  };
};
