
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
      
      // Make sure all hours have the correct dukkan_id
      const hoursWithShopId = hours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));
      
      // Remove any properties that might cause issues
      const cleanedHours = hoursWithShopId.map(hour => {
        const base = {
          id: hour.id,
          dukkan_id: hour.dukkan_id,
          gun: hour.gun,
          gun_sira: hour.gun_sira,
        };

        if (hour.kapali) {
          return {
            ...base,
            acilis: null,
            kapanis: null,
            kapali: true
          };
        }
        
        return {
          ...base,
          acilis: hour.acilis,
          kapanis: hour.kapanis,
          kapali: false
        };
      });
      
      console.log('Sending cleaned hours to server:', cleanedHours);
      const result = await calismaSaatleriServisi.guncelle(cleanedHours);
      console.log('Update result:', result);
      
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
      
      // Clean the object before sending
      const base = {
        id: day.id,
        dukkan_id: dukkanId,
        gun: day.gun,
        gun_sira: day.gun_sira,
      };
      
      const cleanedDay = day.kapali
        ? { ...base, acilis: null, kapanis: null, kapali: true }
        : { ...base, acilis: day.acilis, kapanis: day.kapanis, kapali: false };
      
      console.log('Updating single day:', cleanedDay);
      const result = await calismaSaatleriServisi.tekGuncelle(cleanedDay);
      console.log('Single day update result:', result);
      
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
