
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';
import { gunSirasi } from '../constants/workingDays';

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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: providedGunler.length === 0
  });

  // Properly sort the days from Monday to Sunday
  const calismaSaatleri = [...(providedGunler.length > 0 ? providedGunler : fetchedCalismaSaatleri)]
    .sort((a, b) => {
      const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
      const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
      return aIndex - bIndex;
    });

  const { mutate: saatGuncelle } = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const { error } = await supabase
        .from('calisma_saatleri')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calisma_saatleri'] });
      toast.success('Çalışma saati güncellendi');
    },
    onError: () => {
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
    if (onChange) {
      const index = calismaSaatleri.findIndex(s => s.id === id);
      if (index !== -1 && tempChanges[id]) {
        Object.keys(tempChanges[id]).forEach(key => {
          onChange(index, key as keyof CalismaSaati, tempChanges[id][key as keyof CalismaSaati]);
        });
      }
    } else {
      if (tempChanges[id] && Object.keys(tempChanges[id]).length > 0) {
        saatGuncelle({ id, updates: tempChanges[id] });
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
    calismaSaatleri,
    editing,
    tempChanges,
    startEditing,
    handleTempChange,
    saveChanges,
    cancelEditing
  };
}
