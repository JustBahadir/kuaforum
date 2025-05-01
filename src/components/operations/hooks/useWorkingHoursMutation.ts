
import { useState } from "react";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { toast } from "sonner";

export function useWorkingHoursMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const saveHours = async (hours: any[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to save working hours:", hours);
      
      let dukkanId = hours[0]?.dukkan_id;
      
      // If we don't have dukkanId from hours, try to get it
      if (!dukkanId) {
        console.log("No dukkan_id in hours data, retrieving...");
        dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
      }
      
      if (!dukkanId) {
        console.error("No dukkan_id found for working hours");
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      console.log("Using dukkan_id:", dukkanId);
      
      // Process each hour
      for (const hour of hours) {
        const hourData = {
          ...hour,
          dukkan_id: dukkanId,
        };
        
        console.log("Processing hour:", hourData);
        
        if (hour.id) {
          // Update existing
          console.log("Updating existing hour:", hour.id);
          await calismaSaatleriServisi.guncelle(hour.id, {
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali,
            dukkan_id: dukkanId,
          });
          console.log("Hour updated successfully");
        } else {
          // Create new
          console.log("Creating new hour");
          await calismaSaatleriServisi.ekle({
            gun: hour.gun,
            gun_sira: hour.gun_sira,
            dukkan_id: dukkanId,
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali,
          });
          console.log("Hour created successfully");
        }
      }
      
      toast.success("Çalışma saatleri güncellendi");
      return true;
    } catch (error: any) {
      console.error("Error saving working hours:", error);
      setError(error);
      toast.error(`Çalışma saatleri kaydedilemedi: ${error.message}`);
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
