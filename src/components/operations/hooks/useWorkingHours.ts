
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CalismaSaati } from "@/lib/supabase/types";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { kategoriServisi } from "@/lib/supabase/services/kategoriServisi";

interface UseWorkingHoursProps {
  dukkanId?: number;
  onMutationSuccess?: () => void;
}

export function useWorkingHours({ dukkanId, onMutationSuccess }: UseWorkingHoursProps = {}) {
  const [hours, setHours] = useState<CalismaSaati[]>([]);
  const [originalHours, setOriginalHours] = useState<CalismaSaati[]>([]);

  // Get current dukkan_id if not provided
  const getCurrentDukkanId = async () => {
    if (dukkanId) return dukkanId;
    return await kategoriServisi.getCurrentUserDukkanId();
  };

  // Fetch working hours
  const { 
    data = [], 
    isLoading, 
    error, 
    isError,
    refetch
  } = useQuery({
    queryKey: ["working-hours", dukkanId],
    queryFn: async () => {
      const shopId = await getCurrentDukkanId();
      if (!shopId) throw new Error("İşletme bilgisi bulunamadı");
      return calismaSaatleriServisi.dukkanSaatleriGetir(shopId);
    },
    refetchOnWindowFocus: false
  });

  // Update hours when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setHours(data);
      setOriginalHours(JSON.parse(JSON.stringify(data))); // Deep copy
    }
  }, [data]);

  // Save hours mutation
  const { mutateAsync: saveHoursMutation } = useMutation({
    mutationFn: async () => {
      return await calismaSaatleriServisi.guncelle(hours);
    },
    onSuccess: () => {
      refetch();
      if (onMutationSuccess) onMutationSuccess();
    }
  });

  // Update a specific day
  const updateDay = (index: number, updates: Partial<CalismaSaati>) => {
    setHours(prev => {
      const newHours = [...prev];
      newHours[index] = { ...newHours[index], ...updates };
      return newHours;
    });
  };

  // Save changes
  const saveHours = async () => {
    await saveHoursMutation();
  };

  // Reset to original state
  const resetHours = () => {
    setHours(JSON.parse(JSON.stringify(originalHours)));
  };

  // Check if there are changes
  const hasChanges = () => {
    return JSON.stringify(hours) !== JSON.stringify(originalHours);
  };

  return {
    hours,
    updateDay,
    saveHours,
    resetHours,
    isLoading,
    error,
    isError,
    hasChanges,
    refetch
  };
}
