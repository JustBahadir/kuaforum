
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { CalismaSaati } from '@/lib/supabase/types';
import { toast } from 'sonner';

interface UseWorkingHoursMutationProps {
  dukkanId: number;
  onMutationSuccess?: () => void;
}

export const useWorkingHoursMutation = (props: UseWorkingHoursMutationProps) => {
  const { dukkanId, onMutationSuccess } = props;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update all working hours
  const updateAllHoursMutation = useMutation({
    mutationFn: async (hours: CalismaSaati[]) => {
      setIsUpdating(true);
      try {
        const result = await calismaSaatleriServisi.guncelle(hours);
        return result;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dukkan_saatleri', dukkanId] });
      toast.success('Çalışma saatleri başarıyla güncellendi');
      if (onMutationSuccess) onMutationSuccess();
    },
    onError: (error: any) => {
      console.error('Çalışma saatleri güncelleme hatası:', error);
      toast.error(`Hata: ${error.message || 'Çalışma saatleri güncellenemedi'}`);
    }
  });

  // Update a single day's working hours
  const updateSingleDayMutation = useMutation({
    mutationFn: async (day: CalismaSaati) => {
      setIsUpdating(true);
      try {
        const result = await calismaSaatleriServisi.tekGuncelle(day);
        return result;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dukkan_saatleri', dukkanId] });
      toast.success('Çalışma saati başarıyla güncellendi');
      if (onMutationSuccess) onMutationSuccess();
    },
    onError: (error: any) => {
      console.error('Çalışma saati güncelleme hatası:', error);
      toast.error(`Hata: ${error.message || 'Çalışma saati güncellenemedi'}`);
    }
  });

  // Wrapper functions
  const updateAllHours = async (hours: CalismaSaati[]): Promise<boolean> => {
    try {
      await updateAllHoursMutation.mutateAsync(hours);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateSingleDay = async (day: CalismaSaati): Promise<boolean> => {
    try {
      await updateSingleDayMutation.mutateAsync(day);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    updateAllHours,
    updateSingleDay,
    isLoading,
    isUpdating
  };
};
