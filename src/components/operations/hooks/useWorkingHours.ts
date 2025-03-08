
import { useState, useCallback } from "react";
import { CalismaSaati } from "@/lib/supabase/types";
import { gunSiralama } from "../constants/workingDays";
import { useWorkingHoursMutation } from "./useWorkingHoursMutation";

export function useWorkingHours(dukkanId: number, onMutationSuccess?: () => void) {
  const [saatler, setSaatler] = useState<CalismaSaati[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempSaatler, setTempSaatler] = useState<CalismaSaati[]>([]);
  
  const { 
    updateAllHours, 
    updateSingleDay, 
    isLoading, 
    isUpdating 
  } = useWorkingHoursMutation(dukkanId);

  // Initialize working hours with default values
  const initWorkingHours = useCallback((hours: CalismaSaati[]) => {
    if (!hours || !hours.length) {
      return;
    }
    
    // Sort days based on our predefined order
    const sortedHours = [...hours].sort((a, b) => {
      const aIndex = gunSiralama.indexOf(a.gun);
      const bIndex = gunSiralama.indexOf(b.gun);
      return aIndex - bIndex;
    });
    
    setSaatler(sortedHours);
  }, []);

  // Enter edit mode
  const startEditing = useCallback(() => {
    // Create a deep copy for editing
    setTempSaatler(JSON.parse(JSON.stringify(saatler)));
    setEditMode(true);
  }, [saatler]);

  // Cancel editing and discard changes
  const cancelEditing = useCallback(() => {
    setEditMode(false);
    setTempSaatler([]);
  }, []);

  // Save all changes
  const saveChanges = useCallback(async () => {
    if (!tempSaatler.length) return false;
    
    // Validate hours before saving
    for (const hour of tempSaatler) {
      if (!hour.kapali) {
        if (!hour.acilis || !hour.kapanis) {
          return false;
        }
        
        // Parse times and check if opening is before closing
        const acilis = hour.acilis.split(':').map(Number);
        const kapanis = hour.kapanis.split(':').map(Number);
        
        const acilisDakika = acilis[0] * 60 + acilis[1];
        const kapanisDakika = kapanis[0] * 60 + kapanis[1];
        
        if (acilisDakika >= kapanisDakika) {
          return false;
        }
      }
    }
    
    const success = await updateAllHours(tempSaatler);
    
    if (success) {
      setSaatler(tempSaatler);
      setEditMode(false);
      if (onMutationSuccess) onMutationSuccess();
    }
    
    return success;
  }, [tempSaatler, updateAllHours, onMutationSuccess]);

  // Update a single property of a specific hour
  const updateTime = useCallback((index: number, field: "acilis" | "kapanis", value: string) => {
    if (!editMode || !tempSaatler.length) return;
    
    const updatedHours = [...tempSaatler];
    updatedHours[index][field] = value;
    setTempSaatler(updatedHours);
  }, [editMode, tempSaatler]);

  // Toggle shop status for a day (open/closed)
  const toggleStatus = useCallback((index: number, closed: boolean) => {
    if (!editMode || !tempSaatler.length) return;
    
    const updatedHours = [...tempSaatler];
    updatedHours[index].kapali = closed;
    
    // Clear times if closed
    if (closed) {
      updatedHours[index].acilis = null;
      updatedHours[index].kapanis = null;
    } else {
      // Set default times if opening
      updatedHours[index].acilis = "09:00";
      updatedHours[index].kapanis = "19:00";
    }
    
    setTempSaatler(updatedHours);
  }, [editMode, tempSaatler]);

  return {
    saatler,
    tempSaatler,
    editMode,
    isLoading,
    isUpdating,
    initWorkingHours,
    startEditing,
    cancelEditing,
    saveChanges,
    updateTime,
    toggleStatus,
    updateSingleDay
  };
}
