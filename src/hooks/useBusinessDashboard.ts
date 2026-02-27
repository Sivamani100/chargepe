import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useRealTimeStations } from "./useRealTimeStation";
import { useBookingSystem } from "./useBookingSystem";

export interface StationMetrics {
  station_id: string;
  total_revenue: number;
  total_sessions: number;
  average_session_duration: number;
  utilization_rate: number;
  peak_hours: number[];
  popular_connectors: string[];
  customer_satisfaction: number;
  maintenance_score: number;
  energy_consumed: number;
  co2_saved: number;
}

export interface RevenueAnalytics {
  daily: Array<{
    date: string;
    revenue: number;
    sessions: number;
    energy_kwh: number;
    customers: number;
  }>;
  weekly: Array<{
    week: string;
    revenue: number;
    sessions: number;
    energy_kwh: number;
    customers: number;
  }>;
  monthly: Array<{
    month: string;
    revenue: number;
    sessions: number;
    energy_kwh: number;
    customers: number;
  }>;
}

export interface CustomerAnalytics {
  new_customers: number;
  returning_customers: number;
  customer_retention_rate: number;
  average_customer_lifetime_value: number;
  top_customers: Array<{
    customer_id: string;
    customer_name: string;
    total_spent: number;
    sessions: number;
    last_visit: string;
  }>;
  customer_segments: Array<{
    segment: string;
    count: number;
    average_spent: number;
    retention_rate: number;
  }>;
}

export interface OperationalAlert {
  id: string;
  type: "maintenance" | "low_availability" | "high_demand" | "payment_issue" | "equipment_failure";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  station_id?: string;
  created_at: string;
  resolved_at?: string;
  action_required: boolean;
}

export interface PricingStrategy {
  base_price: number;
  peak_hour_multiplier: number;
  off_peak_discount: number;
  demand_pricing: boolean;
  competitor_prices: Array<{
    station_name: string;
    price: number;
    distance: number;
  }>;
  recommended_price: number;
  price_elasticity: number;
}

export interface MaintenanceSchedule {
  id: string;
  station_id: string;
  equipment_type: string;
  scheduled_date: string;
  estimated_duration: number;
  priority: "low" | "medium" | "high";
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  cost: number;
  technician: string;
  notes: string;
}

export const useBusinessDashboard = () => {
  const { user } = useAuth();
  const { stations } = useRealTimeStations();
  const { bookings } = useBookingSystem();
  const [metrics, setMetrics] = useState<StationMetrics[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics>({
    daily: [],
    weekly: [],
    monthly: [],
  });
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy | null>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is station owner
  const isStationOwner = useMemo(() => {
    return user?.user_metadata?.role === "station_owner" || user?.user_metadata?.role === "admin";
  }, [user]);

  // Get stations owned by the user
  const ownedStations = useMemo(() => {
    if (!isStationOwner) return [];
    return stations.filter(station => 
      station.submitted_by === user?.id || 
      user?.user_metadata?.owned_stations?.includes(station.id)
    );
  }, [stations, user, isStationOwner]);

  // Generate station metrics
  const generateMetrics = useCallback(() => {
    const stationMetrics: StationMetrics[] = ownedStations.map(station => {
      const stationBookings = bookings.filter(b => b.station_id === station.id && b.status === 'completed');
      
      const totalRevenue = stationBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
      const totalSessions = stationBookings.length;
      const averageSessionDuration = totalSessions > 0 
        ? stationBookings.reduce((sum, b) => sum + (b.duration_minutes || 0), 0) / totalSessions 
        : 0;
      
      const utilizationRate = station.utilization_rate || 0;
      const energyConsumed = totalRevenue / station.price_per_kwh; // Rough estimate
      const co2Saved = energyConsumed * 1.8; // kg CO2 saved vs gasoline

      return {
        station_id: station.id,
        total_revenue: totalRevenue,
        total_sessions: totalSessions,
        average_session_duration: averageSessionDuration,
        utilization_rate: utilizationRate,
        peak_hours: [8, 9, 17, 18, 19], // Mock data
        popular_connectors: [station.connector_type],
        customer_satisfaction: station.rating || 0,
        maintenance_score: 85, // Mock score
        energy_consumed: energyConsumed,
        co2_saved: co2Saved,
      };
    });

    setMetrics(stationMetrics);
  }, [ownedStations, bookings]);

  // Generate revenue analytics
  const generateRevenueAnalytics = useCallback(() => {
    const today = new Date();
    const generateDailyData = () => {
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayBookings = bookings.filter(b => 
          ownedStations.some(s => s.id === b.station_id) &&
          b.status === 'completed' &&
          new Date(b.created_at).toDateString() === date.toDateString()
        );
        
        data.push({
          date: date.toISOString().split('T')[0],
          revenue: dayBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
          sessions: dayBookings.length,
          energy_kwh: dayBookings.reduce((sum, b) => sum + ((b.amount || 0) / 15), 0),
          customers: new Set(dayBookings.map(b => b.user_id)).size,
        });
      }
      return data;
    };

    const generateWeeklyData = () => {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekBookings = bookings.filter(b => 
          ownedStations.some(s => s.id === b.station_id) &&
          b.status === 'completed' &&
          new Date(b.created_at) >= weekStart &&
          new Date(b.created_at) <= weekEnd
        );
        
        data.push({
          week: `Week ${12 - i}`,
          revenue: weekBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
          sessions: weekBookings.length,
          energy_kwh: weekBookings.reduce((sum, b) => sum + ((b.amount || 0) / 15), 0),
          customers: new Set(weekBookings.map(b => b.user_id)).size,
        });
      }
      return data;
    };

    const generateMonthlyData = () => {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        
        const monthBookings = bookings.filter(b => 
          ownedStations.some(s => s.id === b.station_id) &&
          b.status === 'completed' &&
          new Date(b.created_at) >= month &&
          new Date(b.created_at) <= monthEnd
        );
        
        data.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
          sessions: monthBookings.length,
          energy_kwh: monthBookings.reduce((sum, b) => sum + ((b.amount || 0) / 15), 0),
          customers: new Set(monthBookings.map(b => b.user_id)).size,
        });
      }
      return data;
    };

    setRevenueAnalytics({
      daily: generateDailyData(),
      weekly: generateWeeklyData(),
      monthly: generateMonthlyData(),
    });
  }, [ownedStations, bookings]);

  // Generate customer analytics
  const generateCustomerAnalytics = useCallback(() => {
    const allBookings = bookings.filter(b => 
      ownedStations.some(s => s.id === b.station_id) && b.status === 'completed'
    );
    
    const customerMap = new Map<string, { spent: number; sessions: number; lastVisit: string }>();
    
    allBookings.forEach(booking => {
      if (!customerMap.has(booking.user_id)) {
        customerMap.set(booking.user_id, {
          spent: 0,
          sessions: 0,
          lastVisit: booking.created_at,
        });
      }
      
      const customer = customerMap.get(booking.user_id)!;
      customer.spent += booking.amount || 0;
      customer.sessions += 1;
      if (new Date(booking.created_at) > new Date(customer.lastVisit)) {
        customer.lastVisit = booking.created_at;
      }
    });

    const customers = Array.from(customerMap.entries()).map(([id, data]) => ({
      customer_id: id,
      customer_name: `Customer ${id.slice(0, 8)}`,
      total_spent: data.spent,
      sessions: data.sessions,
      last_visit: data.lastVisit,
    }));

    const newCustomers = customers.filter(c => 
      new Date(c.last_visit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const returningCustomers = customers.length - newCustomers;
    const retentionRate = customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0;
    const avgLifetimeValue = customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length 
      : 0;

    setCustomerAnalytics({
      new_customers: newCustomers,
      returning_customers: returningCustomers,
      customer_retention_rate: retentionRate,
      average_customer_lifetime_value: avgLifetimeValue,
      top_customers: customers.sort((a, b) => b.total_spent - a.total_spent).slice(0, 10),
      customer_segments: [
        {
          segment: "Regular",
          count: customers.filter(c => c.sessions > 5).length,
          average_spent: customers.filter(c => c.sessions > 5).reduce((sum, c) => sum + c.total_spent, 0) / customers.filter(c => c.sessions > 5).length,
          retention_rate: 85,
        },
        {
          segment: "Occasional",
          count: customers.filter(c => c.sessions <= 5).length,
          average_spent: customers.filter(c => c.sessions <= 5).reduce((sum, c) => sum + c.total_spent, 0) / customers.filter(c => c.sessions <= 5).length,
          retention_rate: 45,
        },
      ],
    });
  }, [ownedStations, bookings]);

  // Generate operational alerts
  const generateAlerts = useCallback(() => {
    const alerts: OperationalAlert[] = [];

    ownedStations.forEach(station => {
      // Low availability alert
      if (station.live_available_slots === 0 && station.total_slots > 0) {
        alerts.push({
          id: `alert_${station.id}_availability`,
          type: "low_availability",
          severity: "high",
          title: "No Available Slots",
          description: `${station.name} has no available charging slots`,
          station_id: station.id,
          created_at: new Date().toISOString(),
          action_required: true,
        });
      }

      // High demand alert
      if (station.utilization_rate > 90) {
        alerts.push({
          id: `alert_${station.id}_demand`,
          type: "high_demand",
          severity: "medium",
          title: "High Demand",
          description: `${station.name} is experiencing very high demand (${station.utilization_rate}% utilization)`,
          station_id: station.id,
          created_at: new Date().toISOString(),
          action_required: false,
        });
      }

      // Maintenance alert (mock)
      if (Math.random() > 0.8) {
        alerts.push({
          id: `alert_${station.id}_maintenance`,
          type: "maintenance",
          severity: "medium",
          title: "Maintenance Required",
          description: `Routine maintenance recommended for ${station.name}`,
          station_id: station.id,
          created_at: new Date().toISOString(),
          action_required: true,
        });
      }
    });

    setAlerts(alerts);
  }, [ownedStations]);

  // Generate pricing strategy
  const generatePricingStrategy = useCallback(() => {
    if (ownedStations.length === 0) return;

    const avgPrice = ownedStations.reduce((sum, s) => sum + s.price_per_kwh, 0) / ownedStations.length;
    
    const strategy: PricingStrategy = {
      base_price: avgPrice,
      peak_hour_multiplier: 1.2,
      off_peak_discount: 0.15,
      demand_pricing: true,
      competitor_prices: [
        {
          station_name: "Competitor A",
          price: avgPrice * 0.9,
          distance: 2.5,
        },
        {
          station_name: "Competitor B",
          price: avgPrice * 1.1,
          distance: 3.1,
        },
      ],
      recommended_price: avgPrice * 1.05,
      price_elasticity: -0.3,
    };

    setPricingStrategy(strategy);
  }, [ownedStations]);

  // Generate maintenance schedule
  const generateMaintenanceSchedule = useCallback(() => {
    const schedule: MaintenanceSchedule[] = [];

    ownedStations.forEach(station => {
      schedule.push({
        id: `maint_${station.id}_monthly`,
        station_id: station.id,
        equipment_type: "General Inspection",
        scheduled_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_duration: 120,
        priority: "medium",
        status: "scheduled",
        cost: 150,
        technician: "Tech Team A",
        notes: "Monthly routine inspection and cleaning",
      });

      if (Math.random() > 0.7) {
        schedule.push({
          id: `maint_${station.id}_urgent`,
          station_id: station.id,
          equipment_type: "Charger Unit",
          scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_duration: 240,
          priority: "high",
          status: "scheduled",
          cost: 500,
          technician: "Tech Team B",
          notes: "Urgent maintenance required for charger performance issues",
        });
      }
    });

    setMaintenanceSchedule(schedule);
  }, [ownedStations]);

  // Update pricing
  const updatePricing = async (stationId: string, newPrice: number): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state (in real app, this would update the database)
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update pricing" };
    }
  };

  // Schedule maintenance
  const scheduleMaintenance = async (maintenance: Omit<MaintenanceSchedule, "id">): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMaintenance: MaintenanceSchedule = {
        ...maintenance,
        id: `maint_${Date.now()}`,
      };

      setMaintenanceSchedule(prev => [...prev, newMaintenance]);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to schedule maintenance" };
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved_at: new Date().toISOString(), action_required: false }
          : alert
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to resolve alert" };
    }
  };

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return metrics.reduce((sum, m) => sum + m.total_revenue, 0);
  }, [metrics]);

  // Calculate total sessions
  const totalSessions = useMemo(() => {
    return metrics.reduce((sum, m) => sum + m.total_sessions, 0);
  }, [metrics]);

  // Calculate average utilization
  const averageUtilization = useMemo(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.utilization_rate, 0) / metrics.length;
  }, [metrics]);

  // Initialize data
  useEffect(() => {
    if (isStationOwner && ownedStations.length > 0) {
      setIsLoading(true);
      generateMetrics();
      generateRevenueAnalytics();
      generateCustomerAnalytics();
      generateAlerts();
      generatePricingStrategy();
      generateMaintenanceSchedule();
      setIsLoading(false);
    }
  }, [isStationOwner, ownedStations, generateMetrics, generateRevenueAnalytics, generateCustomerAnalytics, generateAlerts, generatePricingStrategy, generateMaintenanceSchedule]);

  return {
    isStationOwner,
    ownedStations,
    metrics,
    revenueAnalytics,
    customerAnalytics,
    alerts,
    pricingStrategy,
    maintenanceSchedule,
    totalRevenue,
    totalSessions,
    averageUtilization,
    isLoading,
    updatePricing,
    scheduleMaintenance,
    resolveAlert,
  };
};
