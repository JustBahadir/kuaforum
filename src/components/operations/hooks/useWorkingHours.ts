
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { useWorkingHoursMutation } from './useWorkingHoursMutation';

interface UseWorkingHoursProps {
  dukkanId: number;
  onMutationSuccess?: () => void;
}

export function useWorkingHours({ dukkanId, onMutationSuccess }: UseWorkingHoursProps) {
  const [workingHours, setWorkingHours] = useState<CalismaSaati[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHours, setOriginalHours] = useState<CalismaSaati[]>([]);
  
  // Use the mutation hook for updates
  const mutation = useWorkingHoursMutation(dukkanId);
  const { updateAllHours, updateSingleDay, isLoading: isMutationLoading, isUpdating } = mutation;

  // Fetch working hours with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dukkan_saatleri', dukkanId],
    queryFn: async () => {
      console.log("Fetching working hours for dukkan ID:", dukkanId);
      if (!dukkanId) return [];
      return await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
    },
    enabled: !!dukkanId
  });

  // Update state when data changes
  useEffect(() => {
    if (data) {
      setWorkingHours(data);
      setOriginalHours(JSON.parse(JSON.stringify(data))); // Deep clone
    }
  }, [data]);

  const handleSave = async () => {
    const success = await updateAllHours(workingHours);
    if (success) {
      setIsEditing(false);
      if (onMutationSuccess) onMutationSuccess();
    }
  };

  const handleCancel = () => {
    setWorkingHours([...originalHours]);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setOriginalHours(JSON.parse(JSON.stringify(workingHours))); // Deep clone
    setIsEditing(true);
  };

  // Update time for a specific day
  const updateTime = (id: number, field: 'acilis' | 'kapanis', value: string) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, [field]: value } : hour
      )
    );
  };

  // Toggle status for a specific day
  const toggleStatus = (id: number) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, kapali: !hour.kapali } : hour
      )
    );
  };

  return {
    workingHours,
    isLoading: isLoading || isMutationLoading,
    isEditing,
    isUpdating,
    isError,
    error,
    handleEdit,
    handleSave,
    handleCancel,
    updateTime,
    toggleStatus
  };
}
