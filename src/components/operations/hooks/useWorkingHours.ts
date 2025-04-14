
import { useState, useEffect, useCallback } from "react";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { CalismaSaati } from "@/lib/supabase/types";
import { gunSiralama } from "../constants/workingDays";

interface UseWorkingHoursProps {
  dukkanId: number;
  onMutationSuccess?: () => void;
}

export const useWorkingHours = ({ dukkanId, onMutationSuccess }: UseWorkingHoursProps) => {
  const [hours, setHours] = useState<CalismaSaati[]>([]);
  const [originalHours, setOriginalHours] = useState<CalismaSaati[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchHours = useCallback(async () => {
    if (!dukkanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedHours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      if (fetchedHours && fetchedHours.length > 0) {
        // Sort by the predefined day order
        const sortedHours = [...fetchedHours].sort((a, b) => {
          const aIndex = gunSiralama.indexOf(a.gun);
          const bIndex = gunSiralama.indexOf(b.gun);
          return aIndex - bIndex;
        });
        setHours(sortedHours);
        setOriginalHours(JSON.parse(JSON.stringify(sortedHours)));
      } else {
        const defaultHours = generateDefaultHours(dukkanId);
        setHours(defaultHours);
        setOriginalHours(JSON.parse(JSON.stringify(defaultHours)));
      }
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [dukkanId]);
  
  useEffect(() => {
    fetchHours();
  }, [fetchHours]);
  
  // Generate default working hours
  const generateDefaultHours = (dukkanId: number): CalismaSaati[] => {
    return gunSiralama.map((gun, index) => ({
      id: -(index + 1), // Negative IDs for unsaved records
      gun,
      gun_sira: index + 1,
      acilis: "09:00",
      kapanis: "18:00",
      kapali: gun === "pazar", // Close Sundays by default
      dukkan_id: dukkanId
    }));
  };
  
  // Update a single day
  const updateDay = useCallback((index: number, updates: Partial<CalismaSaati>) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], ...updates };
      return newHours;
    });
  }, []);
  
  // Save all hours
  const saveHours = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Make sure all hours have dukkan_id
      const hoursWithDukkanId = hours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));
      
      await calismaSaatleriServisi.guncelle(hoursWithDukkanId);
      setOriginalHours(JSON.parse(JSON.stringify(hours)));
      
      if (onMutationSuccess) {
        onMutationSuccess();
      }
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [hours, dukkanId, onMutationSuccess]);
  
  // Reset hours to original state
  const resetHours = useCallback(() => {
    setHours(JSON.parse(JSON.stringify(originalHours)));
  }, [originalHours]);
  
  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    return JSON.stringify(hours) !== JSON.stringify(originalHours);
  }, [hours, originalHours]);
  
  return {
    hours,
    workingHours: hours, // For backward compatibility
    updateDay,
    saveHours,
    resetHours,
    isLoading,
    error,
    isError: !!error,
    hasChanges,
    refetch: fetchHours,
    updateWorkingHours: saveHours // For backward compatibility
  };
};
