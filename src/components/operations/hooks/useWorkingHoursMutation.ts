
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { prepareHourUpdates } from '../utils/workingHoursUtils';

interface WorkingHoursMutationProps {
  dukkanId?: number;
  onMutationSuccess?: () => void;
}

export function useWorkingHoursMutation({ dukkanId, onMutationSuccess }: WorkingHoursMutationProps = {}) {
  const queryClient = useQueryClient();
  
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
    if (dukkanId) {
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri', dukkanId] });
    }
  };

  const { mutate: saatGuncelle, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, updates, currentDay }: { 
      id: number; 
      updates: Partial<CalismaSaati>;
      currentDay?: CalismaSaati;
    }) => {
      console.log("Updating working hours:", id, updates);
      
      // Prepare updates with proper validation
      const preparedUpdates = prepareHourUpdates(id, updates, currentDay, dukkanId);
      
      try {
        if (id < 0) {
          // For temporary records, use the simplified ekle method
          const newData = {
            gun: preparedUpdates.gun || "",
            acilis: preparedUpdates.kapali ? null : (preparedUpdates.acilis || "09:00"),
            kapanis: preparedUpdates.kapali ? null : (preparedUpdates.kapanis || "18:00"),
            kapali: preparedUpdates.kapali || false,
            dukkan_id: preparedUpdates.dukkan_id || 0
          };
          
          const result = await calismaSaatleriServisi.ekle(newData);
          return { id, updates, result };
        }
        
        // Use the dedicated single update method for existing records
        const result = await calismaSaatleriServisi.tekGuncelle(id, preparedUpdates);
        return { id, updates, result };
      } catch (error) {
        console.error("Error updating working hour:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      invalidateQueries();
      
      if (data?.result) {
        toast.success('Çalışma saati güncellendi');
        console.log("Update successful:", data);
        
        if (onMutationSuccess) {
          onMutationSuccess();
        }
      } else {
        toast.error('Güncelleme sırasında bir hata oluştu');
      }
    },
    onError: (error: any) => {
      console.error("Çalışma saati güncellenirken hata:", error);
      toast.error(error?.message || 'Güncelleme sırasında bir hata oluştu');
    }
  });

  const { mutate: statusToggle } = useMutation({
    mutationFn: async ({ id, isOpen, currentDay }: { 
      id: number; 
      isOpen: boolean;
      currentDay: CalismaSaati;
    }) => {
      console.log(`Toggling status for ID ${id}, setting to isOpen:`, isOpen);
      
      const updates: Partial<CalismaSaati> = {
        kapali: !isOpen,
        gun: currentDay.gun,
        dukkan_id: dukkanId || currentDay.dukkan_id
      };
      
      // If closing, clear times
      if (!isOpen) {
        updates.acilis = null;
        updates.kapanis = null;
      } else {
        // If opening, set default times
        updates.acilis = "09:00";
        updates.kapanis = "18:00";
      }
      
      // Re-use the existing mutation
      return saatGuncelle({ id, updates, currentDay });
    },
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error: any) => {
      console.error("Durum değişikliği sırasında hata:", error);
      toast.error(error?.message || "Durum güncellenirken bir hata oluştu");
    }
  });
  
  return {
    saatGuncelle,
    statusToggle,
    isUpdating
  };
}
