import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RealTimeStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  available_slots: number;
  total_slots: number;
  power_output_kw: number;
  price_per_kwh: number;
  rating: number;
  review_count: number;
  connector_type: string;
  operating_hours: string;
  contact_info: string | null;
  is_approved: boolean;
  submitted_by: string | null;
  // Real-time properties
  live_available_slots: number;
  queue_time: number;
  last_updated: string;
  charging_speeds: number[];
  utilization_rate: number;
  estimated_wait_time: number;
}

export const useRealTimeStation = (stationId: string) => {
  const [station, setStation] = useState<RealTimeStation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!stationId) return;

    // Initial station data fetch
    const fetchStation = async () => {
      const { data, error } = await supabase
        .from("charging_stations")
        .select("*")
        .eq("id", stationId)
        .single();
      
      if (!error && data) {
        setStation({
          ...data,
          live_available_slots: data.available_slots,
          queue_time: 0,
          last_updated: new Date().toISOString(),
          charging_speeds: [data.power_output_kw],
          utilization_rate: 0,
          estimated_wait_time: 0,
        });
      }
    };

    fetchStation();

    // Set up real-time subscription
    const channel = supabase
      .channel(`station-${stationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "charging_stations",
          filter: `id=eq.${stationId}`,
        },
        (payload) => {
          const updatedData = payload.new as any;
          setStation(prev => prev ? {
            ...prev,
            ...updatedData,
            live_available_slots: updatedData.available_slots,
            last_updated: new Date().toISOString(),
            utilization_rate: ((updatedData.total_slots - updatedData.available_slots) / updatedData.total_slots) * 100,
          } : null);
          setLastUpdate(new Date().toISOString());
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [stationId]);

  return { station, isConnected, lastUpdate };
};

export const useRealTimeStations = () => {
  const [stations, setStations] = useState<RealTimeStation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Initial stations fetch
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from("charging_stations")
        .select("*")
        .eq("is_approved", true);
      
      if (!error && data) {
        const enrichedStations = data.map((station: any) => ({
          ...station,
          live_available_slots: station.available_slots,
          queue_time: 0,
          last_updated: new Date().toISOString(),
          charging_speeds: [station.power_output_kw],
          utilization_rate: ((station.total_slots - station.available_slots) / station.total_slots) * 100,
          estimated_wait_time: 0,
        }));
        setStations(enrichedStations);
      }
    };

    fetchStations();

    // Set up real-time subscription for all stations
    const channel = supabase
      .channel("all-stations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "charging_stations",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setStations(prev => prev.map(station => 
              station.id === payload.new.id 
                ? {
                    ...station,
                    ...payload.new,
                    live_available_slots: payload.new.available_slots,
                    last_updated: new Date().toISOString(),
                    utilization_rate: ((payload.new.total_slots - payload.new.available_slots) / payload.new.total_slots) * 100,
                  }
                : station
            ));
          } else if (payload.eventType === "INSERT") {
            const newStation: RealTimeStation = {
              id: payload.new.id,
              name: payload.new.name,
              address: payload.new.address,
              latitude: payload.new.latitude,
              longitude: payload.new.longitude,
              status: payload.new.status,
              available_slots: payload.new.available_slots,
              total_slots: payload.new.total_slots,
              power_output_kw: payload.new.power_output_kw,
              price_per_kwh: payload.new.price_per_kwh,
              rating: payload.new.rating,
              review_count: payload.new.review_count,
              connector_type: payload.new.connector_type,
              operating_hours: payload.new.operating_hours,
              contact_info: payload.new.contact_info,
              is_approved: payload.new.is_approved,
              submitted_by: payload.new.submitted_by,
              live_available_slots: payload.new.available_slots,
              queue_time: 0,
              last_updated: new Date().toISOString(),
              charging_speeds: [payload.new.power_output_kw],
              utilization_rate: ((payload.new.total_slots - payload.new.available_slots) / payload.new.total_slots) * 100,
              estimated_wait_time: 0,
            };
            setStations(prev => [...prev, newStation]);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  return { stations, isConnected };
};
