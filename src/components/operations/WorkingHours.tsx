
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CalismaSaati } from '@/lib/supabase/types';

interface WorkingHoursProps {
  isStaff?: boolean;
  gunler?: CalismaSaati[];
  onChange?: (index: number, field: keyof CalismaSaati, value: any) => void;
}

export function WorkingHours({ isStaff = true, gunler = [], onChange }: WorkingHoursProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const [tempChanges, setTempChanges] = useState<Record<number, Partial<CalismaSaati>>>({});
  const queryClient = useQueryClient();

  // If gunler are provided from props, use them, otherwise fetch from API
  const { data: fetchedCalismaSaatleri = [] } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .order('id');
      if (error) throw error;
      return data;
    },
    enabled: gunler.length === 0 // Only fetch if gunler not provided
  });

  // Use either the props gunler or fetched data
  const calismaSaatleri = gunler.length > 0 ? gunler : fetchedCalismaSaatleri;

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
      // If using parent component's state management
      const index = calismaSaatleri.findIndex(s => s.id === id);
      if (index !== -1 && tempChanges[id]) {
        Object.keys(tempChanges[id]).forEach(key => {
          onChange(index, key as keyof CalismaSaati, tempChanges[id][key as keyof CalismaSaati]);
        });
      }
    } else {
      // If using direct DB update
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gün</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açılış</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kapanış</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
            {isStaff && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {calismaSaatleri.map((saat: CalismaSaati, index: number) => (
            <tr key={saat.id || index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {saat.gun}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editing === (saat.id || index) ? (
                  <Input
                    type="time"
                    defaultValue={saat.acilis}
                    onChange={(e) => handleTempChange(saat.id || index, 'acilis', e.target.value)}
                  />
                ) : (
                  saat.kapali ? "-" : saat.acilis
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editing === (saat.id || index) ? (
                  <Input
                    type="time"
                    defaultValue={saat.kapanis}
                    onChange={(e) => handleTempChange(saat.id || index, 'kapanis', e.target.value)}
                  />
                ) : (
                  saat.kapali ? "-" : saat.kapanis
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {isStaff ? (
                  editing === (saat.id || index) ? (
                    <Switch
                      checked={!((tempChanges[saat.id || index]?.kapali !== undefined) 
                        ? tempChanges[saat.id || index].kapali 
                        : saat.kapali)}
                      onCheckedChange={(checked) => handleTempChange(saat.id || index, 'kapali', !checked)}
                    />
                  ) : (
                    <Switch
                      checked={!saat.kapali}
                      onCheckedChange={(checked) => {
                        handleTempChange(saat.id || index, 'kapali', !checked);
                        saveChanges(saat.id || index);
                      }}
                    />
                  )
                ) : (
                  saat.kapali ? "Kapalı" : "Açık"
                )}
              </td>
              {isStaff && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editing === (saat.id || index) ? (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => saveChanges(saat.id || index)}
                      >
                        Kaydet
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEditing(saat.id || index)}
                      >
                        İptal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => startEditing(saat.id || index)}
                    >
                      Düzenle
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
