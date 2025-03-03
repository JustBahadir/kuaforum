
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
      setEditing(null);
    },
    onError: () => {
      toast.error('Güncelleme sırasında bir hata oluştu');
    }
  });

  const handleUpdate = (id: number, updates: any) => {
    if (onChange) {
      // If using parent component's state management
      const index = calismaSaatleri.findIndex(s => s.id === id);
      if (index !== -1) {
        Object.keys(updates).forEach(key => {
          onChange(index, key as keyof CalismaSaati, updates[key]);
        });
      }
    } else {
      // If using direct DB update
      saatGuncelle({ id, updates });
    }
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
                    onChange={(e) => handleUpdate(saat.id || index, { acilis: e.target.value })}
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
                    onChange={(e) => handleUpdate(saat.id || index, { kapanis: e.target.value })}
                  />
                ) : (
                  saat.kapali ? "-" : saat.kapanis
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {isStaff ? (
                  <Switch
                    checked={!saat.kapali}
                    onCheckedChange={(checked) => handleUpdate(saat.id || index, { kapali: !checked })}
                  />
                ) : (
                  saat.kapali ? "Kapalı" : "Açık"
                )}
              </td>
              {isStaff && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(editing === (saat.id || index) ? null : (saat.id || index))}
                  >
                    {editing === (saat.id || index) ? 'Kaydet' : 'Düzenle'}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
