
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
      console.log("Saving working hours:", hours);
      
      // Validate dukkanId
      let dukkanId = hours[0]?.dukkan_id;
      
      // If we don't have dukkanId from hours, try to get it
      if (!dukkanId) {
        dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
      }
      
      if (!dukkanId) {
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      console.log("Using shop ID:", dukkanId);
      
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
            acilis: hour.kapali ? null : hour.acilis,
            kapanis: hour.kapali ? null : hour.kapanis,
            kapali: hour.kapali,
          });
        } else {
          // Create new
          console.log("Creating new hour");
          await calismaSaatleriServisi.ekle({
            gun: hour.gun,
            gun_sira: hour.gun_sira,
            dukkan_id: dukkanId,
            acilis: hour.kapali ? null : hour.acilis,
            kapanis: hour.kapali ? null : hour.kapanis,
            kapali: hour.kapali,
          });
        }
      }
      
      toast.success("Çalışma saatleri başarıyla güncellendi", {
        position: "bottom-right"
      });
      
      return true;
    } catch (error: any) {
      console.error("Working hours save error:", error);
      setError(error);
      toast.error(`Çalışma saatleri güncellenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`, {
        position: "bottom-right"
      });
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
