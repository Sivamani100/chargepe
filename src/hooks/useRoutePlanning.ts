import { useState, useMemo } from "react";
import { RealTimeStation } from "./useRealTimeStation";

export interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
  type: "start" | "waypoint" | "end";
}

export interface ChargingStop {
  station: RealTimeStation;
  arrivalBatteryLevel: number;
  departureBatteryLevel: number;
  chargingTime: number; // in minutes
  waitTime: number; // in minutes
  cost: number;
  distanceFromPrevious: number; // in km
}

export interface RoutePlan {
  totalDistance: number;
  totalTime: number;
  totalCost: number;
  totalChargingTime: number;
  stops: ChargingStop[];
  route: RoutePoint[];
  efficiency: number;
}

export interface VehicleProfile {
  batteryCapacity: number; // kWh
  maxRange: number; // km
  efficiency: number; // km/kWh
  maxChargingSpeed: number; // kW
  currentBatteryLevel: number; // percentage
  targetBatteryLevel: number; // percentage
}

export const useRoutePlanning = () => {
  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile>({
    batteryCapacity: 75,
    maxRange: 400,
    efficiency: 5.3,
    maxChargingSpeed: 150,
    currentBatteryLevel: 80,
    targetBatteryLevel: 20,
  });

  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

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

  const calculateChargingTime = (
    currentLevel: number,
    targetLevel: number,
    batteryCapacity: number,
    chargingPower: number
  ): number => {
    const energyNeeded = batteryCapacity * ((targetLevel - currentLevel) / 100);
    // Simple linear charging model (in reality, charging curves are non-linear)
    const chargingTime = (energyNeeded / chargingPower) * 60; // Convert to minutes
    return Math.max(15, chargingTime); // Minimum 15 minutes
  };

  const findNearbyStations = (
    point: RoutePoint,
    stations: RealTimeStation[],
    maxDistance: number = 50
  ): (RealTimeStation & { distance: number })[] => {
    return stations
      .map(station => ({
        ...station,
        distance: calculateDistance(point.latitude, point.longitude, station.latitude, station.longitude),
      }))
      .filter(station => station.distance <= maxDistance && station.live_available_slots > 0)
      .sort((a, b) => a.distance - b.distance);
  };

  const planRoute = (start: RoutePoint, end: RoutePoint, stations: RealTimeStation[]): RoutePlan | null => {
    if (routePoints.length === 0) return null;

    const totalDistance = calculateDistance(start.latitude, start.longitude, end.latitude, end.longitude);
    const energyNeeded = totalDistance / vehicleProfile.efficiency;
    const currentEnergy = (vehicleProfile.currentBatteryLevel / 100) * vehicleProfile.batteryCapacity;
    
    // If we have enough battery to reach destination directly
    if (currentEnergy >= energyNeeded) {
      return {
        totalDistance,
        totalTime: (totalDistance / 80) * 60, // Assuming 80 km/h average speed
        totalCost: 0,
        totalChargingTime: 0,
        stops: [],
        route: [start, end],
        efficiency: (totalDistance / vehicleProfile.efficiency) / vehicleProfile.batteryCapacity * 100,
      };
    }

    // Find optimal charging stops
    const stops: ChargingStop[] = [];
    let currentPoint = start;
    let currentBatteryLevel = vehicleProfile.currentBatteryLevel;
    let remainingDistance = totalDistance;
    let totalCost = 0;
    let totalChargingTime = 0;

    while (remainingDistance > (currentBatteryLevel / 100) * vehicleProfile.maxRange) {
      const nearbyStations = findNearbyStations(currentPoint, stations, 50);
      
      if (nearbyStations.length === 0) {
        return null; // No stations available
      }

      // Find the best station (considering distance, price, and availability)
      const bestStation = nearbyStations[0]; // Simplified - could use scoring algorithm
      
      const distanceToStation = bestStation.distance;
      const batteryAtArrival = Math.max(
        0,
        currentBatteryLevel - (distanceToStation / vehicleProfile.maxRange) * 100
      );

      // Calculate charging needed to reach next stop or destination
      const nextRange = Math.min(
        vehicleProfile.maxRange,
        remainingDistance - distanceToStation
      );
      const targetChargeLevel = Math.min(
        90,
        ((nextRange / vehicleProfile.maxRange) * 100) + 20 // 20% buffer
      );

      const chargingPower = Math.min(vehicleProfile.maxChargingSpeed, bestStation.power_output_kw);
      const chargingTime = calculateChargingTime(
        batteryAtArrival,
        targetChargeLevel,
        vehicleProfile.batteryCapacity,
        chargingPower
      );

      const waitTime = bestStation.estimated_wait_time || 0;
      const cost = (vehicleProfile.batteryCapacity * ((targetChargeLevel - batteryAtArrival) / 100)) * bestStation.price_per_kwh;

      stops.push({
        station: bestStation,
        arrivalBatteryLevel: batteryAtArrival,
        departureBatteryLevel: targetChargeLevel,
        chargingTime,
        waitTime,
        cost,
        distanceFromPrevious: distanceToStation,
      });

      // Update state for next iteration
      currentPoint = {
        latitude: bestStation.latitude,
        longitude: bestStation.longitude,
        address: bestStation.address,
        type: "waypoint",
      };
      currentBatteryLevel = targetChargeLevel;
      remainingDistance -= distanceToStation;
      totalCost += cost;
      totalChargingTime += chargingTime;
    }

    const totalTime = (totalDistance / 80) * 60 + totalChargingTime + stops.reduce((sum, stop) => sum + stop.waitTime, 0);

    return {
      totalDistance,
      totalTime,
      totalCost,
      totalChargingTime,
      stops,
      route: [start, ...stops.map(stop => ({
        latitude: stop.station.latitude,
        longitude: stop.station.longitude,
        address: stop.station.address,
        type: "waypoint" as const,
      })), end],
      efficiency: (totalDistance / vehicleProfile.efficiency) / vehicleProfile.batteryCapacity * 100,
    };
  };

  const updateVehicleProfile = (updates: Partial<VehicleProfile>) => {
    setVehicleProfile(prev => ({ ...prev, ...updates }));
  };

  const addRoutePoint = (point: RoutePoint) => {
    setRoutePoints(prev => [...prev, point]);
  };

  const removeRoutePoint = (index: number) => {
    setRoutePoints(prev => prev.filter((_, i) => i !== index));
  };

  const clearRoute = () => {
    setRoutePoints([]);
  };

  return {
    vehicleProfile,
    routePoints,
    updateVehicleProfile,
    addRoutePoint,
    removeRoutePoint,
    clearRoute,
    planRoute,
    calculateDistance,
  };
};
