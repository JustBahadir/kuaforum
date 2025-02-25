
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WorkingHoursProps {
  isStaff: boolean;
}

export function WorkingHours({ isStaff }: WorkingHoursProps) {
  const [editing, setEditing] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: calismaSaatleri = [] } = useQuery({
    queryKey: ['calisma_saatleri'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .order('id');
      if (error) throw error;
      return data;
    }
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
      setEditing(null);
    },
    onError: () => {
      toast.error('Güncelleme sırasında bir hata oluştu');
    }
  });

  const handleUpdate = (id: number, updates: any) => {
    saatGuncelle({ id, updates });
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
          {calismaSaatleri.map((saat: any) => (
            <tr key={saat.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {saat.gun}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editing === saat.id ? (
                  <Input
                    type="time"
                    defaultValue={saat.acilis}
                    onChange={(e) => handleUpdate(saat.id, { acilis: e.target.value })}
                  />
                ) : (
                  saat.kapali ? "-" : saat.acilis
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editing === saat.id ? (
                  <Input
                    type="time"
                    defaultValue={saat.kapanis}
                    onChange={(e) => handleUpdate(saat.id, { kapanis: e.target.value })}
                  />
                ) : (
                  saat.kapali ? "-" : saat.kapanis
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {isStaff ? (
                  <Switch
                    checked={!saat.kapali}
                    onCheckedChange={(checked) => handleUpdate(saat.id, { kapali: !checked })}
                  />
                ) : (
                  saat.kapali ? "Kapalı" : "Açık"
                )}
              </td>
              {isStaff && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(editing === saat.id ? null : saat.id)}
                  >
                    {editing === saat.id ? 'Kaydet' : 'Düzenle'}
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
