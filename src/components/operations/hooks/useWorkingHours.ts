
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { calismaSaatleriServisi } from '@/lib/supabase/services/calismaSaatleriServisi';
import { gunSiralama } from '../constants/workingDays';

export function useWorkingHours(
  isStaff: boolean = true,
  providedGunler: CalismaSaati[] = [],
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void
) {
  const [editing, setEditing] = useState<number | null>(null);
  const [tempChanges, setTempChanges] = useState<Record<number, Partial<CalismaSaati>>>({});
  const queryClient = useQueryClient();

  const { data: fetchedCalismaSaatleri = [], isLoading, error } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: calismaSaatleriServisi.hepsiniGetir,
    enabled: providedGunler.length === 0
  });

  // Use the provided working hours if available, otherwise use the fetched ones
  const calismaSaatleri = [...(providedGunler.length > 0 ? providedGunler : fetchedCalismaSaatleri)];

  // IMPORTANT: Always sort by predefined day order and never resort after editing
  const sortedSaatler = [...calismaSaatleri].sort((a, b) => {
    const aIndex = gunSiralama.indexOf(a.gun);
    const bIndex = gunSiralama.indexOf(b.gun);
    return aIndex - bIndex;
  });

  const { mutate: saatGuncelle } = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      if (!id) {
        throw new Error('ID is required for updating working hours');
      }
      
      console.log("Updating working hours:", id, updates);
      
      // Use the dedicated single update method instead
      const result = await calismaSaatleriServisi.tekGuncelle(id, updates);
      
      return { id, updates, result };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
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

  const saveChanges = (id: number) => {
    const saat = calismaSaatleri.find(s => {
      const saatId = typeof s.id === 'number' ? s.id : Number(s.id);
      return saatId === id;
    });
    
    if (!saat) {
      console.error(`Saat ID ${id} bulunamadı`);
      toast.error("Çalışma saati bulunamadı");
      return;
    }

    if (onChange) {
      // For external controlled components
      const index = calismaSaatleri.findIndex(s => {
        const saatId = typeof s.id === 'number' ? s.id : Number(s.id);
        return saatId === id;
      });
      
      if (index !== -1 && tempChanges[id]) {
        Object.keys(tempChanges[id]).forEach(key => {
          onChange(index, key as keyof CalismaSaati, tempChanges[id][key as keyof CalismaSaati]);
        });
      }
    } else {
      // For internal updates with Supabase
      if (tempChanges[id] && Object.keys(tempChanges[id]).length > 0) {
        const updates = {
          ...tempChanges[id],
          // If shop is marked as closed, ensure times are cleared if they were modified
          ...(tempChanges[id].kapali ? { 
            acilis: null, 
            kapanis: null 
          } : {})
        };
        
        saatGuncelle({ id, updates });
      }
    }
    
    setEditing(null);
    setTempChanges(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
  };

  const cancelEditing = (id: number) => {
    setEditing(null);
    setTempChanges(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
  };

  return {
    calismaSaatleri: sortedSaatler, // Always return the sorted array
    editing,
    tempChanges,
    isLoading,
    error,
    startEditing,
    handleTempChange,
    saveChanges,
    cancelEditing
  };
}
