
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { CalismaSaati } from '@/lib/supabase/types';
import { toast } from 'sonner';

export interface UseWorkingHoursMutationProps {
  dukkanId: number;
  onMutationSuccess?: () => void;
}

export const useWorkingHoursMutation = (props: UseWorkingHoursMutationProps) => {
  const { dukkanId, onMutationSuccess } = props;
  
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update all working hours
  const updateAllHours = useCallback(async (hours: CalismaSaati[]) => {
    try {
      setIsLoading(true);
      console.log('Updating all hours for dukkan ID:', dukkanId);
      
      // Ensure all hours have the correct dukkan_id
      const hoursWithShopId = hours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));
      
      await calismaSaatleriServisi.guncelle(hoursWithShopId);
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['calisma_saatleri', dukkanId] });
      
      toast.success('Çalışma saatleri başarıyla güncellendi');
      
      if (onMutationSuccess) {
        onMutationSuccess();
      }
    } catch (error) {
      console.error('Hours update error:', error);
      toast.error('Çalışma saatleri güncellenirken bir hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dukkanId, queryClient, onMutationSuccess]);

  // Update a single day
  const updateSingleDay = useCallback(async (day: CalismaSaati) => {
    try {
      setIsUpdating(true);
      await calismaSaatleriServisi.tekGuncelle({
        ...day,
        dukkan_id: dukkanId
      });
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['calisma_saatleri', dukkanId] });
      
      toast.success('Çalışma saati başarıyla güncellendi');
      
      if (onMutationSuccess) {
        onMutationSuccess();
      }
    } catch (error) {
      console.error('Single day update error:', error);
      toast.error('Çalışma saati güncellenirken bir hata oluştu');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [dukkanId, queryClient, onMutationSuccess]);

  return {
    updateAllHours,
    updateSingleDay,
    isLoading,
    isUpdating
  };
};
