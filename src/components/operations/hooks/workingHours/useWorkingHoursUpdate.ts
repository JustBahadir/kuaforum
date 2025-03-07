
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';

/**
 * Hook for managing working hours updates
 */
export function useWorkingHoursUpdate(dukkanId?: number) {
  const queryClient = useQueryClient();

  // Mutation for updating a single working hour
  const { mutate: saatGuncelle, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CalismaSaati> }) => {
      console.log("Updating working hours:", id, updates);
      
      try {
        if (id < 0) {
          // This is a temporary ID, need to create new record
          const newSaat = {
            gun: updates.gun || "",
            acilis: updates.kapali ? null : (updates.acilis || "09:00"),
            kapanis: updates.kapali ? null : (updates.kapanis || "18:00"),
            kapali: updates.kapali || false,
            dukkan_id: dukkanId || 0
          };
          
          const result = await calismaSaatleriServisi.ekle(newSaat);
          return { id, updates, result };
        }
        
        // Use the dedicated single update method for existing records
        const result = await calismaSaatleriServisi.tekGuncelle(id, updates);
        return { id, updates, result };
      } catch (error) {
        console.error("Error updating working hours:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
      if (dukkanId) {
        queryClient.invalidateQueries({ queryKey: ['calisma_saatleri', dukkanId] });
        queryClient.invalidateQueries({ queryKey: ['dukkan_saatleri', dukkanId] });
      }
      
      toast.success('Çalışma saati güncellendi');
      console.log("Update successful:", data);
    },
    onError: (error) => {
      console.error("Çalışma saati güncellenirken hata:", error);
      toast.error('Güncelleme sırasında bir hata oluştu');
    }
  });

  return { saatGuncelle, isUpdating };
}
