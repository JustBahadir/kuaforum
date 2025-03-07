
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { gunSiralama } from '../constants/workingDays';

export function useWorkingHours(
  isStaff: boolean = true,
  providedGunler: CalismaSaati[] = [],
  dukkanId?: number,
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void
) {
  const [editing, setEditing] = useState<number | null>(null);
  const [tempChanges, setTempChanges] = useState<Record<number, Partial<CalismaSaati>>>({});
  const queryClient = useQueryClient();

  // If dukkanId is provided, fetch hours for that shop
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
        
        // If no data returned, create default working hours
        if (!data || data.length === 0) {
          // Create default working hours
          data = gunSiralama.map((gun, index) => ({
            id: -(index + 1), // Using negative IDs to indicate these are temporary
            gun,
            acilis: "09:00",
            kapanis: "18:00",
            kapali: false,
            dukkan_id: dukkanId || 0
          }));
        }
        
        console.log("Working hours retrieved:", data);
        return data;
      } catch (err) {
        console.error("Error fetching working hours:", err);
        throw err;
      }
    },
    staleTime: 30000 // 30 seconds
  });

  // Use the provided working hours if available, otherwise use the fetched ones
  const calismaSaatleri = providedGunler.length > 0 ? providedGunler : fetchedCalismaSaatleri;

  // Always sort by predefined day order
  const sortedSaatler = [...calismaSaatleri].sort((a, b) => {
    const aIndex = gunSiralama.indexOf(a.gun);
    const bIndex = gunSiralama.indexOf(b.gun);
    return aIndex - bIndex;
  });

  // Mutation for updating a single working hour
  const { mutate: saatGuncelle, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CalismaSaati> }) => {
      console.log("Updating working hours:", id, updates);
      
      try {
        if (id < 0) {
          // This is a temporary ID, need to create new record
          const newSaat = {
            gun: updates.gun || "",
            acilis: updates.kapali ? null : (updates.acilis || "09:00"),
            kapanis: updates.kapali ? null : (updates.kapanis || "18:00"),
            kapali: updates.kapali || false,
            dukkan_id: dukkanId || 0
          };
          
          const result = await calismaSaatleriServisi.ekle(newSaat);
          return { id, updates, result };
        }
        
        // Use the dedicated single update method for existing records
        const result = await calismaSaatleriServisi.tekGuncelle(id, updates);
        return { id, updates, result };
      } catch (error) {
        console.error("Error updating working hours:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
      if (dukkanId) {
        queryClient.invalidateQueries({ queryKey: ['calisma_saatleri', dukkanId] });
        queryClient.invalidateQueries({ queryKey: ['dukkan_saatleri', dukkanId] });
      }
      
      // Reset editing state
      setEditing(null);
      setTempChanges(prev => {
        const updated = {...prev};
        delete updated[data.id];
        return updated;
      });
      
      toast.success('Çalışma saati güncellendi');
      console.log("Update successful:", data);
    },
    onError: (error) => {
      console.error("Çalışma saati güncellenirken hata:", error);
      toast.error('Güncelleme sırasında bir hata oluştu');
    }
  });

  const startEditing = (id: number) => {
    setEditing(id);
    setTempChanges(prev => ({
      ...prev,
      [id]: {}
    }));
  };

  const handleTempChange = (id: number, field: keyof CalismaSaati, value: any) => {
    setTempChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
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
        setEditing(null);
        setTempChanges(prev => {
          const updated = {...prev};
          delete updated[id];
          return updated;
        });
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
          setEditing(null);
          setTempChanges(prev => {
            const updated = {...prev};
            delete updated[id];
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Çalışma saati kaydedilirken hata:", error);
      toast.error("Güncelleme sırasında bir hata oluştu");
    }
  };

  const cancelEditing = (id: number) => {
    setEditing(null);
    setTempChanges(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
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
