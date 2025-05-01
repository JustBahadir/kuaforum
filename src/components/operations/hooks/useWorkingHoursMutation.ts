
import { useState } from 'react';
import { toast } from 'sonner';
import { calismaSaatleriServisi } from '@/lib/supabase';
import { CalismaSaati } from '@/lib/supabase/types';

interface UseWorkingHoursMutationProps {
  dukkanId: number;
  onMutationSuccess?: () => void;
}

export const useWorkingHoursMutation = ({ dukkanId, onMutationSuccess }: UseWorkingHoursMutationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveHours = async (hours: Partial<CalismaSaati>[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare hours with dukkan_id
      const preparedHours = hours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));

      // Check if any hours have existing IDs
      const existingHours = preparedHours.filter(hour => hour.id);
      const newHours = preparedHours.filter(hour => !hour.id);

      // Update existing hours
      if (existingHours.length > 0) {
        await calismaSaatleriServisi.guncelle(existingHours as CalismaSaati[]);
      }

      // Create new hours
      if (newHours.length > 0) {
        await calismaSaatleriServisi.dukkanSaatleriKaydet(newHours);
      }

      if (onMutationSuccess) {
        onMutationSuccess();
      }
    } catch (err: any) {
      console.error('Error saving working hours:', err);
      setError(err.message || 'Çalışma saatleri kaydedilirken bir hata oluştu');
      toast.error(err.message || 'Çalışma saatleri kaydedilirken bir hata oluştu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveHours,
    isLoading,
    error
  };
};
