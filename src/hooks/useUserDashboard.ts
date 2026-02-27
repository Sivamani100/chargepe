import { useState, useMemo } from "react";
import { useAuth } from "./useAuth";
import { useBookingSystem } from "./useBookingSystem";
import { useRealTimeStations } from "./useRealTimeStation";

export interface UserAnalytics {
  totalSessions: number;
  totalEnergyConsumed: number;
  totalCost: number;
  averageSessionDuration: number;
  favoriteStation: string;
  co2Saved: number; // kg
  totalDistance: number; // km
  moneySavedVsGas: number;
  preferredConnectorType: string;
  peakChargingTime: string;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  sessions: number;
  energy: number;
  cost: number;
  co2Saved: number;
}

export interface FavoriteStations {
  stationId: string;
  name: string;
  visits: number;
  totalEnergy: number;
  totalCost: number;
  averageRating: number;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "digital_wallet" | "ev_charging_card";
  last4?: string;
  brand?: string;
  isDefault: boolean;
  nickname?: string;
}

export const useUserDashboard = () => {
  const { user, profile } = useAuth();
  const { bookings } = useBookingSystem();
  const { stations } = useRealTimeStations();

  // Mock payment methods (would come from database)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "visa",
      isDefault: true,
      nickname: "Personal Card",
    },
    {
      id: "2",
      type: "digital_wallet",
      brand: "apple_pay",
      isDefault: false,
      nickname: "Apple Pay",
    },
  ]);

  // Calculate user analytics
  const analytics = useMemo((): UserAnalytics => {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    
    const totalSessions = completedBookings.length;
    const totalEnergyConsumed = completedBookings.reduce((sum, b) => sum + (b.amount || 0) / 15, 0); // Rough estimate
    const totalCost = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const averageSessionDuration = totalSessions > 0 
      ? completedBookings.reduce((sum, b) => sum + (b.duration_minutes || 0), 0) / totalSessions 
      : 0;
    
    // CO2 saved (assuming 0.5 kg CO2 per kWh vs 2.3 kg for gasoline)
    const co2Saved = totalEnergyConsumed * (2.3 - 0.5);
    
    // Distance covered (assuming 5 km per kWh)
    const totalDistance = totalEnergyConsumed * 5;
    
    // Money saved vs gasoline (assuming $8 per gallon, 25 mpg)
    const gasCost = (totalDistance / 25) * 8;
    const moneySavedVsGas = Math.max(0, gasCost - totalCost);
    
    // Favorite station
    const stationCounts = completedBookings.reduce((acc, b) => {
      acc[b.station_id] = (acc[b.station_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteStationId = Object.entries(stationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "";
    
    // Preferred connector type
    const connectorCounts = completedBookings.reduce((acc, b) => {
      const station = stations.find(s => s.id === b.station_id);
      if (station) {
        acc[station.connector_type] = (acc[station.connector_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const preferredConnectorType = Object.entries(connectorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "";
    
    // Peak charging time
    const hourCounts = completedBookings.reduce((acc, b) => {
      const hour = new Date(b.start_time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    const peakChargingTime = peakHour ? `${peakHour}:00` : "";
    
    // Monthly stats
    const monthlyStats = completedBookings.reduce((acc, b) => {
      const month = new Date(b.start_time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, sessions: 0, energy: 0, cost: 0, co2Saved: 0 };
      }
      acc[month].sessions += 1;
      acc[month].energy += (b.amount || 0) / 15;
      acc[month].cost += (b.amount || 0);
      acc[month].co2Saved += ((b.amount || 0) / 15) * 1.8;
      return acc;
    }, {} as Record<string, MonthlyStats>);
    
    return {
      totalSessions,
      totalEnergyConsumed,
      totalCost,
      averageSessionDuration,
      favoriteStation: favoriteStationId,
      co2Saved,
      totalDistance,
      moneySavedVsGas,
      preferredConnectorType,
      peakChargingTime,
      monthlyStats: Object.values(monthlyStats).slice(-6), // Last 6 months
    };
  }, [bookings, stations]);

  // Calculate favorite stations
  const favoriteStations = useMemo((): FavoriteStations[] => {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    
    const stationStats = completedBookings.reduce((acc, b) => {
      if (!acc[b.station_id]) {
        const station = stations.find(s => s.id === b.station_id);
        acc[b.station_id] = {
          stationId: b.station_id,
          name: station?.name || "Unknown Station",
          visits: 0,
          totalEnergy: 0,
          totalCost: 0,
          averageRating: station?.rating || 0,
        };
      }
      acc[b.station_id].visits += 1;
      acc[b.station_id].totalEnergy += (b.amount || 0) / 15;
      acc[b.station_id].totalCost += (b.amount || 0);
      return acc;
    }, {} as Record<string, FavoriteStations>);
    
    return Object.values(stationStats)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  }, [bookings, stations]);

  // Add payment method
  const addPaymentMethod = (method: Omit<PaymentMethod, "id">) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  // Remove payment method
  const removePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
  };

  // Set default payment method
  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
  };

  // Get recent activity
  const recentActivity = useMemo(() => {
    return bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(booking => {
        const station = stations.find(s => s.id === booking.station_id);
        return {
          ...booking,
          stationName: station?.name || "Unknown Station",
          stationAddress: station?.address || "",
        };
      });
  }, [bookings, stations]);

  // Get charging insights
  const chargingInsights = useMemo(() => {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    
    // Most used connector type
    const connectorUsage = completedBookings.reduce((acc, b) => {
      const station = stations.find(s => s.id === b.station_id);
      if (station) {
        acc[station.connector_type] = (acc[station.connector_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Average cost per session
    const avgCostPerSession = completedBookings.length > 0
      ? completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0) / completedBookings.length
      : 0;
    
    // Most expensive station
    const stationCosts = completedBookings.reduce((acc, b) => {
      const station = stations.find(s => s.id === b.station_id);
      if (station) {
        if (!acc[station.id] || (b.amount || 0) > acc[station.id].cost) {
          acc[station.id] = { name: station.name, cost: b.amount || 0 };
        }
      }
      return acc;
    }, {} as Record<string, { name: string; cost: number }>);
    
    const mostExpensiveStation = Object.values(stationCosts)
      .sort((a, b) => b.cost - a.cost)[0];
    
    return {
      connectorUsage,
      avgCostPerSession,
      mostExpensiveStation,
    };
  }, [bookings, stations]);

  return {
    analytics,
    favoriteStations,
    paymentMethods,
    recentActivity,
    chargingInsights,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
};
