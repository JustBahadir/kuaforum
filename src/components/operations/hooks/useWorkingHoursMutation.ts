
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalismaSaati } from "@/lib/supabase/types";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

export function useWorkingHoursMutation(initialHours: CalismaSaati[] = []) {
  const [hours, setHours] = useState<CalismaSaati[]>(initialHours);
  const queryClient = useQueryClient();
  
  const { mutate: saveHours, isPending: isLoading } = useMutation({
    mutationFn: async (saatler: CalismaSaati[]) => {
      try {
        // If hours do not have dukkan_id, get the current dukkan id
        if (saatler.length > 0 && !saatler[0].dukkan_id) {
          const dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
          
          // Add dukkan_id to all hours
          saatler = saatler.map(saat => ({
            ...saat,
            dukkan_id: dukkanId
          }));
        }
        
        return calismaSaatleriServisi.saatleriKaydet(saatler);
      } catch (error) {
        console.error("Error saving working hours:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
      toast.success("Çalışma saatleri başarıyla kaydedildi");
    },
    onError: (error: any) => {
      toast.error(`Çalışma saatlerini kaydetme hatası: ${error?.message || 'Bilinmeyen hata'}`);
    }
  });
  
  const updateHour = async (id: number, updates: Partial<CalismaSaati>) => {
    try {
      await calismaSaatleriServisi.guncelle(id, updates);
      
      // Update local state
      setHours(prevHours => 
        prevHours.map(hour => 
          hour.id === id ? { ...hour, ...updates } : hour
        )
      );
      
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
    } catch (error) {
      console.error("Error updating hour:", error);
    }
  };
  
  const addHour = async (hour: Partial<CalismaSaati>) => {
    try {
      await calismaSaatleriServisi.ekle(hour);
      queryClient.invalidateQueries({ queryKey: ['workingHours'] });
    } catch (error) {
      console.error("Error adding hour:", error);
    }
  };
  
  const handleTimeChange = (index: number, field: "acilis" | "kapanis", value: string) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], [field]: value };
      return newHours;
    });
  };
  
  const handleStatusChange = (index: number, value: boolean) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], kapali: value };
      return newHours;
    });
  };
  
  return {
    hours,
    setHours,
    saveHours,
    isLoading,
    updateHour,
    addHour,
    handleTimeChange,
    handleStatusChange
  };
}
