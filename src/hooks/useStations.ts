import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Station {
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
}

export const useStations = (approvedOnly = true) => {
  return useQuery({
    queryKey: ["stations", approvedOnly],
    queryFn: async () => {
      let query = supabase.from("charging_stations").select("*");
      if (approvedOnly) {
        query = query.eq("is_approved", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Station[];
    },
  });
};

export const useStation = (id: string) => {
  return useQuery({
    queryKey: ["station", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charging_stations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Station | null;
    },
    enabled: !!id,
  });
};
