import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealTimeStation } from "./useRealTimeStation";
import { useAuth } from "./useAuth";

export interface BookingSession {
  id: string;
  station_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes: number;
  amount: number;
  created_at: string;
  // Additional fields for enhanced functionality
  estimated_duration?: number;
  actual_duration?: number;
  cost?: number;
  payment_status?: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  booking_code?: string;
  qr_code?: string;
  notes?: string;
  updated_at?: string;
}

export interface ActiveSession extends BookingSession {
  station: RealTimeStation;
  time_remaining: number;
  charging_progress: number;
  current_power: number;
  energy_delivered: number;
}

export const useBookingSystem = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's bookings
  const fetchBookings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, charging_stations(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as BookingSession[]);
    }
    setIsLoading(false);
  };

  // Create a new booking
  const createBooking = async (
    stationId: string,
    startTime: string,
    estimatedDuration: number,
    notes?: string
  ): Promise<{ success: boolean; booking?: BookingSession; error?: string }> => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // Generate booking code
      const bookingCode = `CP${Date.now().toString(36).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          station_id: stationId,
          user_id: user.id,
          start_time: startTime,
          end_time: new Date(new Date(startTime).getTime() + estimatedDuration * 60000).toISOString(),
          duration_minutes: estimatedDuration,
          amount: 0, // Will be calculated after session
          status: 'pending' as const,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBookings();
      return { success: true, booking: data as BookingSession };
    } catch (error) {
      console.error("Booking creation error:", error);
      return { success: false, error: "Failed to create booking" };
    }
  };

  // Start charging session
  const startChargingSession = async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: 'active',
          start_time: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) throw error;

      await fetchBookings();
      return { success: true };
    } catch (error) {
      console.error("Start session error:", error);
      return { success: false, error: "Failed to start charging session" };
    }
  };

  // End charging session
  const endChargingSession = async (
    bookingId: string,
    actualDuration: number,
    energyDelivered: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get booking details to calculate cost
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("*, charging_stations(price_per_kwh)")
        .eq("id", bookingId)
        .single();

      if (fetchError || !booking) throw fetchError;

      const cost = energyDelivered * (booking as any).charging_stations.price_per_kwh;

      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString(),
          duration_minutes: actualDuration,
          amount: cost,
        })
        .eq("id", bookingId);

      if (error) throw error;

      await fetchBookings();
      return { success: true };
    } catch (error) {
      console.error("End session error:", error);
      return { success: false, error: "Failed to end charging session" };
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("station_id, status")
        .eq("id", bookingId)
        .single();

      if (fetchError || !booking) throw fetchError;

      // Only allow cancellation of pending bookings
      if (booking.status !== 'pending') {
        return { success: false, error: "Cannot cancel active or completed booking" };
      }

      const { error } = await supabase
        .from("bookings")
        .update({ status: 'cancelled' })
        .eq("id", bookingId);

      if (error) throw error;

      await fetchBookings();
      return { success: true };
    } catch (error) {
      console.error("Cancel booking error:", error);
      return { success: false, error: "Failed to cancel booking" };
    }
  };

  // Get active session with real-time updates
  const getActiveSession = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*, charging_stations(*)")
      .eq("user_id", user.id)
      .eq("status", 'active')
      .single();

    if (!error && data) {
      const timeRemaining = Math.max(0, 
        new Date(data.end_time).getTime() - new Date().getTime()
      ) / 1000 / 60; // in minutes

      setActiveSession({
        ...data,
        station: data.charging_stations as any,
        time_remaining: timeRemaining,
        charging_progress: 0, // Would come from real-time charging data
        current_power: 0, // Would come from real-time charging data
        energy_delivered: 0, // Would come from real-time charging data
      } as ActiveSession);
    }
  };

  // Set up real-time subscription for active session
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-bookings-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setBookings(prev => prev.map(booking => 
              booking.id === payload.new.id ? { ...booking, ...payload.new } as BookingSession : booking
            ));
            
            // Update active session if it matches
            if (activeSession && activeSession.id === payload.new.id) {
              setActiveSession(prev => prev ? { ...prev, ...payload.new } as ActiveSession : null);
            }
          } else if (payload.eventType === "INSERT") {
            setBookings(prev => [payload.new as BookingSession, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeSession]);

  // Initial data fetch
  useEffect(() => {
    fetchBookings();
    getActiveSession();
  }, [user]);

  return {
    bookings,
    activeSession,
    isLoading,
    createBooking,
    startChargingSession,
    endChargingSession,
    cancelBooking,
    getActiveSession,
    refreshBookings: fetchBookings,
  };
};
