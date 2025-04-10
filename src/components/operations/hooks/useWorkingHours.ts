import { useState, useEffect } from "react";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { CalismaSaati } from "@/lib/supabase/types";

export const useWorkingHours = (dukkanId: number | undefined) => {
  const [workingHours, setWorkingHours] = useState<CalismaSaati[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!dukkanId) return;
    
    const fetchWorkingHours = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const hours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        if (hours && hours.length > 0) {
          setWorkingHours(hours);
        } else {
          const defaultHours = setDefaultWorkingHours(dukkanId);
          setWorkingHours(defaultHours);
        }
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkingHours();
  }, [dukkanId]);
  
  // Update the setWorkingHours function to include the required id property
const setDefaultWorkingHours = (dukkanId: number) => {
  const defaultHours: CalismaSaati[] = [
    { id: 1, dukkan_id: dukkanId, gun: "pazartesi", gun_sira: 1, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 2, dukkan_id: dukkanId, gun: "sali", gun_sira: 2, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 3, dukkan_id: dukkanId, gun: "carsamba", gun_sira: 3, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 4, dukkan_id: dukkanId, gun: "persembe", gun_sira: 4, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 5, dukkan_id: dukkanId, gun: "cuma", gun_sira: 5, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 6, dukkan_id: dukkanId, gun: "cumartesi", gun_sira: 6, acilis: "09:00", kapanis: "18:00", kapali: false },
    { id: 7, dukkan_id: dukkanId, gun: "pazar", gun_sira: 7, acilis: "09:00", kapanis: "18:00", kapali: true }
  ];
  
  setWorkingHours(defaultHours);
  return defaultHours;
};
  
  const updateWorkingHours = async (updatedHours: CalismaSaati[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await calismaSaatleriServisi.topluGuncelle(updatedHours);
      setWorkingHours(updatedHours);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { workingHours, isLoading, error, updateWorkingHours };
};
