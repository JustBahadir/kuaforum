
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { useWorkingHoursMutation, UseWorkingHoursMutationProps } from './useWorkingHoursMutation';
import { gunSiralama } from '../constants/workingDays';

interface UseWorkingHoursProps {
  dukkanId: number;
  onMutationSuccess?: () => void;
}

export const useWorkingHours = ({ dukkanId, onMutationSuccess }: UseWorkingHoursProps) => {
  const [hours, setHours] = useState<CalismaSaati[]>([]);
  const [originalHours, setOriginalHours] = useState<CalismaSaati[]>([]);
  
  // Use the mutation hook for updates
  const mutation = useWorkingHoursMutation({ dukkanId, onMutationSuccess });
  const { updateAllHours, updateSingleDay, isLoading: isMutationLoading, isUpdating } = mutation;

  // Fetch working hours with React Query
  const { 
    data: fetchedHours = [], 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery({
    queryKey: ['calisma_saatleri', dukkanId],
    queryFn: async () => {
      console.log('useWorkingHours: Fetching hours for shop ID:', dukkanId);
      if (!dukkanId) return [];
      
      try {
        const result = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        console.log('useWorkingHours: Fetched hours:', result);
        return result;
      } catch (err) {
        console.error('useWorkingHours: Error fetching hours:', err);
        throw err;
      }
    },
    enabled: !!dukkanId,
  });

  // Update local state when fetched data changes
  useEffect(() => {
    if (fetchedHours && fetchedHours.length > 0) {
      // Sort by our predefined day order
      const sortedHours = [...fetchedHours].sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
      
      setHours(sortedHours);
      setOriginalHours(JSON.parse(JSON.stringify(sortedHours)));
    } else if (dukkanId && !isLoading && fetchedHours.length === 0) {
      // If we have a dukkanId but no hours, create default hours
      const defaultHours = calismaSaatleriServisi.defaultWorkingHours(dukkanId);
      setHours(defaultHours);
      setOriginalHours(JSON.parse(JSON.stringify(defaultHours)));
    }
  }, [fetchedHours, isLoading, dukkanId]);

  // Update a single day
  const updateDay = useCallback((index: number, updates: Partial<CalismaSaati>) => {
    setHours(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }, []);

  // Save current hours to the database
  const saveHours = useCallback(async () => {
    if (hours.length === 0) return;
    
    try {
      console.log('useWorkingHours: Saving hours:', hours);
      await updateAllHours(hours);
      setOriginalHours(JSON.parse(JSON.stringify(hours)));
    } catch (error) {
      console.error('useWorkingHours: Error saving hours:', error);
      throw error;
    }
  }, [hours, updateAllHours]);

  // Reset to original state
  const resetHours = useCallback(() => {
    setHours(JSON.parse(JSON.stringify(originalHours)));
  }, [originalHours]);

  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    if (hours.length !== originalHours.length) return true;
    
    for (let i = 0; i < hours.length; i++) {
      const current = hours[i];
      const original = originalHours[i];
      
      if (current.kapali !== original.kapali) return true;
      if (!current.kapali && !original.kapali) {
        if (current.acilis !== original.acilis) return true;
        if (current.kapanis !== original.kapanis) return true;
      }
    }
    
    return false;
  }, [hours, originalHours]);

  return {
    hours,
    setHours,
    updateDay,
    saveHours,
    resetHours,
    isLoading,
    isError,
    error,
    hasChanges,
    refetch,
    isMutationLoading,
    isUpdating
  };
};
