
import { useState } from 'react';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { useWorkingHoursData } from './workingHours/useWorkingHoursData';
import { useWorkingHoursUpdate } from './workingHours/useWorkingHoursUpdate';
import { useWorkingHoursState } from './workingHours/useWorkingHoursState';
import { UseWorkingHoursResult } from './workingHours/types';

export function useWorkingHours(
  isStaff: boolean = true,
  providedGunler: CalismaSaati[] = [],
  dukkanId?: number,
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void
): UseWorkingHoursResult {
  // Use the sub-hooks
  const { calismaSaatleri, isLoading, error, refetch: originalRefetch } = useWorkingHoursData(providedGunler, dukkanId);
  const { saatGuncelle, isUpdating } = useWorkingHoursUpdate(dukkanId);
  const { 
    editing, 
    tempChanges, 
    startEditing, 
    handleTempChange, 
    cancelEditing,
    resetEditingState
  } = useWorkingHoursState();

  // Wrap the refetch function to match our return type
  const refetch = async (): Promise<void> => {
    await originalRefetch();
  };

  const saveChanges = async (id: number) => {
    try {
      const saat = calismaSaatleri.find(s => {
        return s.id === id || (typeof s.id === 'string' && parseInt(s.id) === id);
      });
      
      if (!saat) {
        console.error(`Saat ID ${id} bulunamadı`);
        toast.error("Çalışma saati bulunamadı");
        return;
      }

      if (onChange) {
        // For external controlled components
        const index = calismaSaatleri.findIndex(s => {
          return s.id === id || (typeof s.id === 'string' && parseInt(s.id) === id);
        });
        
        if (index !== -1 && tempChanges[id]) {
          Object.keys(tempChanges[id]).forEach(key => {
            onChange(index, key as keyof CalismaSaati, tempChanges[id][key as keyof CalismaSaati]);
          });
        }
        
        // Reset editing state for controlled components
        resetEditingState(id);
      } else {
        // For internal updates with Supabase
        if (tempChanges[id] && Object.keys(tempChanges[id]).length > 0) {
          const updates = {
            ...tempChanges[id],
            // If shop is marked as closed, ensure times are cleared
            ...(tempChanges[id].kapali ? { 
              acilis: null, 
              kapanis: null 
            } : {})
          };
          
          await saatGuncelle({ id, updates });
          // Don't reset editing state here as it's handled in the mutation's onSuccess
        } else {
          // If no changes, just exit edit mode
          resetEditingState(id);
        }
      }
    } catch (error) {
      console.error("Çalışma saati kaydedilirken hata:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    }
  };

  const handleStatusToggle = async (id: number, isOpen: boolean) => {
    try {
      console.log(`Toggling status for ID ${id}, current isOpen:`, isOpen);
      
      const updates: Partial<CalismaSaati> = {
        kapali: !isOpen,
      };
      
      // If closing, clear times
      if (isOpen) { // We're toggling from open to closed
        updates.acilis = null;
        updates.kapanis = null;
      } else { // We're toggling from closed to open
        // If opening, set default times
        updates.acilis = "09:00";
        updates.kapanis = "18:00";
      }
      
      console.log("Status toggle updates:", updates);
      await saatGuncelle({ id, updates });
    } catch (error) {
      console.error("Durum değişikliği sırasında hata:", error);
      toast.error("Durum güncellenirken bir hata oluştu");
    }
  };

  return {
    calismaSaatleri,
    editing,
    tempChanges,
    isLoading,
    isUpdating,
    error,
    startEditing,
    handleTempChange,
    saveChanges,
    cancelEditing,
    handleStatusToggle,
    refetch
  };
}
