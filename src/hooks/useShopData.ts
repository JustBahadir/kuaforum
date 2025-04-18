
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useShopData(dukkanId: number) {
  const [error, setError] = useState<string | null>(null);
  
  // Fetch dukkan data
  const { 
    data: dukkanData, 
    isLoading: isLoadingDukkan 
  } = useQuery({
    queryKey: ['shopData', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return null;
      
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('id', dukkanId)
        .single();
      
      if (error) {
        console.error('Error fetching shop data:', error);
        setError(error.message);
        return null;
      }
      
      return data;
    },
    enabled: !!dukkanId
  });
  
  // Fetch personel
  const { 
    data: personelListesi,
    isLoading: isLoadingPersonel
  } = useQuery({
    queryKey: ['shopPersonnel', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('dukkan_id', dukkanId);
      
      if (error) {
        console.error('Error fetching personnel data:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!dukkanId
  });
  
  // Fetch working hours
  const { 
    data: calisma_saatleri,
    isLoading: isLoadingSaatler
  } = useQuery({
    queryKey: ['shopHours', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('id');
      
      if (error) {
        console.error('Error fetching working hours:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!dukkanId
  });
  
  // Fetch services
  const { 
    data: services,
    isLoading: isLoadingServices
  } = useQuery({
    queryKey: ['shopServices', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('islem_adi');
      
      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!dukkanId
  });
  
  const loading = isLoadingDukkan || isLoadingPersonel || isLoadingSaatler || isLoadingServices;
  
  return {
    dukkanData,
    personelListesi,
    calisma_saatleri,
    services,
    loading,
    error,
    isLoadingDukkan,
    isLoadingPersonel,
    isLoadingSaatler,
    isLoadingServices
  };
}
