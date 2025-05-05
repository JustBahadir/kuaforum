
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ShopWorkingHoursCardProps {
  calisma_saatleri: any[];
  userRole: string;
  dukkanId: string | number;
}

export function ShopWorkingHoursCard({ calisma_saatleri, userRole, dukkanId }: ShopWorkingHoursCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingHours, setWorkingHours] = useState<any[]>([...calisma_saatleri]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames: Record<string, string> = {
    'Pazartesi': 'Pazartesi',
    'Sali': 'Salı',
    'Carsamba': 'Çarşamba',
    'Persembe': 'Perşembe',
    'Cuma': 'Cuma',
    'Cumartesi': 'Cumartesi',
    'Pazar': 'Pazar'
  };

  const dayOrder = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi', 'Pazar'];

  const sortedHours = [...workingHours].sort((a, b) => {
    return dayOrder.indexOf(a.gun) - dayOrder.indexOf(b.gun);
  });

  const handleHoursChange = (index: number, field: 'acilis' | 'kapanis', value: string) => {
    const updatedHours = [...workingHours];
    updatedHours[index][field] = value;
    setWorkingHours(updatedHours);
  };

  const handleClosedToggle = (index: number) => {
    const updatedHours = [...workingHours];
    updatedHours[index].kapali = !updatedHours[index].kapali;
    setWorkingHours(updatedHours);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      for (const hour of workingHours) {
        const { error } = await supabase
          .from('calisma_saatleri')
          .update({
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali
          })
          .eq('id', hour.id);
          
        if (error) throw error;
      }
      
      toast.success('Çalışma saatleri güncellendi');
      setIsEditing(false);
    } catch (error) {
      console.error('Çalışma saatleri güncellenirken hata:', error);
      toast.error('Çalışma saatleri güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = userRole === 'admin' || userRole === 'isletme_sahibi';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Çalışma Saatleri
        </CardTitle>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Düzenle
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {sortedHours.length > 0 ? (
          <div className="space-y-2">
            {sortedHours.map((hour) => (
              <div key={hour.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                <span className="font-medium">{dayNames[hour.gun] || hour.gun}</span>
                <span className="text-gray-600">
                  {hour.kapali 
                    ? 'Kapalı' 
                    : `${hour.acilis} - ${hour.kapanis}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Çalışma saatleri ayarlanmamış
          </div>
        )}
      </CardContent>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Çalışma Saatlerini Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {workingHours.sort((a, b) => dayOrder.indexOf(a.gun) - dayOrder.indexOf(b.gun)).map((hour, index) => (
              <div key={hour.id} className="grid grid-cols-[1fr,2fr] gap-4 items-center">
                <span className="font-medium">{dayNames[hour.gun] || hour.gun}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hour.kapali}
                      onChange={() => handleClosedToggle(index)}
                      id={`closed-${hour.id}`}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`closed-${hour.id}`} className="text-sm">Kapalı</label>
                  </div>
                  {!hour.kapali && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hour.acilis}
                        onChange={(e) => handleHoursChange(index, 'acilis', e.target.value)}
                        className="w-24 text-xs px-2 py-1 border rounded"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={hour.kapanis}
                        onChange={(e) => handleHoursChange(index, 'kapanis', e.target.value)}
                        className="w-24 text-xs px-2 py-1 border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
