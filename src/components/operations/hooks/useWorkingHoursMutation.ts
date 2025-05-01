
import { useState } from "react";
import { calismaSaatleriServisi } from "@/lib/supabase";

export function useWorkingHoursMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const saveHours = async (hours: any[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let dukkanId = hours[0]?.dukkan_id;
      
      // If we don't have dukkanId from hours, try to get it
      if (!dukkanId) {
        dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
      }
      
      if (!dukkanId) {
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      // Process each hour
      for (const hour of hours) {
        const hourData = {
          ...hour,
          dukkan_id: dukkanId,
        };
        
        if (hour.id) {
          // Update existing
          await calismaSaatleriServisi.guncelle(hour.id, {
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali,
          });
        } else {
          // Create new
          await calismaSaatleriServisi.ekle({
            gun: hour.gun,
            gun_sira: hour.gun_sira,
            dukkan_id: dukkanId,
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali,
          });
        }
      }
      
      return true;
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    saveHours,
    isLoading,
    error
  };
}
