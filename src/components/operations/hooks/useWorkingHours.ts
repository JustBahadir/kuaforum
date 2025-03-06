import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
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

  const { data: fetchedCalismaSaatleri = [] } = useQuery({
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
      const { error } = await supabase
        .from('calisma_saatleri')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
      toast.success('Çalışma saati güncellendi');
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
    const saat = calismaSaatleri.find(s => (s.id || 0) === id);
    if (!saat) return;

    if (onChange) {
      const index = calismaSaatleri.findIndex(s => (s.id || 0) === id);
      if (index !== -1 && tempChanges[id]) {
        Object.keys(tempChanges[id]).forEach(key => {
          onChange(index, key as keyof CalismaSaati, tempChanges[id][key as keyof CalismaSaati]);
        });
      }
    } else {
      if (tempChanges[id] && Object.keys(tempChanges[id]).length > 0) {
        saatGuncelle({ 
          id, 
          updates: {
            ...tempChanges[id],
            // If shop is marked as closed, ensure times are cleared if they were modified
            ...(tempChanges[id].kapali ? { 
              acilis: null, 
              kapanis: null 
            } : {})
          } 
        });
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
    startEditing,
    handleTempChange,
    saveChanges,
    cancelEditing
  };
}
