import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { useWorkingHoursState } from './useWorkingHoursState';
import { useWorkingHoursMutation } from './useWorkingHoursMutation';
import { sortWorkingHours, createDefaultWorkingHours } from '../utils/workingHoursUtils';

interface UseWorkingHoursProps {
  isStaff?: boolean;
  providedGunler?: CalismaSaati[];
  dukkanId?: number;
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void;
}

export function useWorkingHours({
  isStaff = true,
  providedGunler = [],
  dukkanId,
  onChange
}: UseWorkingHoursProps = {}) {
  // Use our state management hook
  const {
    editing,
    tempChanges,
    startEditing,
    handleTempChange,
    cancelEditing,
    clearEditingState
  } = useWorkingHoursState();

  // Fetch working hours data
  const { 
    data: fetchedCalismaSaatleri = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['calisma_saatleri', dukkanId],
    queryFn: async () => {
      console.log("useWorkingHours: Fetching working hours, dukkanId:", dukkanId);
      try {
        let data;
        if (dukkanId) {
          // If we have a shop ID, get hours for that shop
          data = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        } else {
          // Otherwise get all hours
          data = await calismaSaatleriServisi.hepsiniGetir();
        }
        
        // If no data returned, use default working hours but don't save them yet
        if (!data || data.length === 0) {
          data = createDefaultWorkingHours(dukkanId);
        }
        
        console.log("Working hours retrieved:", data);
        return data;
      } catch (err) {
        console.error("Error fetching working hours:", err);
        
        // Return default working hours in case of error
        return createDefaultWorkingHours(dukkanId);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 seconds
  });

  // Use mutation hook for updates
  const {
    saatGuncelle,
    statusToggle,
    isUpdating
  } = useWorkingHoursMutation({ 
    dukkanId,
    onMutationSuccess: () => {
      // Force refresh to show updated state
      setTimeout(() => refetch(), 500);
    }
  });

  // Use the provided working hours if available, otherwise use the fetched ones
  const calismaSaatleri = providedGunler.length > 0 ? providedGunler : fetchedCalismaSaatleri;

  // Always sort by predefined day order
  const sortedSaatler = sortWorkingHours(calismaSaatleri);

  // Handle saving changes
  const saveChanges = async (id: number) => {
    const saat = calismaSaatleri.find(s => {
      return s.id === id || (typeof s.id === 'string' && parseInt(s.id) === id);
    });
    
    if (!saat) {
      console.error(`Saat ID ${id} bulunamadı`);
      toast.error("Çalışma saati bulunamadı");
      return;
    }

    try {
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
      } else {
        // For internal updates with Supabase
        if (tempChanges[id] && Object.keys(tempChanges[id]).length > 0) {
          await saatGuncelle({ 
            id, 
            updates: tempChanges[id],
            currentDay: saat
          });
        } else {
          toast.info("Değişiklik yapılmadı");
        }
      }
      
      clearEditingState(id);
    } catch (error) {
      console.error("Çalışma saati kaydedilirken hata:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    }
  };

  // Handle status toggle (open/closed)
  const handleStatusToggle = async (id: number, isOpen: boolean) => {
    try {
      // Find the current day record
      const currentDay = sortedSaatler.find(s => s.id === id);
      if (!currentDay) {
        console.error(`ID ${id} için gün bulunamadı`);
        return;
      }
      
      await statusToggle({
        id,
        isOpen,
        currentDay
      });
    } catch (error) {
      console.error("Durum değişikliği sırasında hata:", error);
      toast.error("Durum güncellenirken bir hata oluştu");
    }
  };

  // Log errors to the console
  useEffect(() => {
    if (error) {
      console.error("Error in useWorkingHours:", error);
    }
  }, [error]);

  return {
    calismaSaatleri: sortedSaatler,
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
