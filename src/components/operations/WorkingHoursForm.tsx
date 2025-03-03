
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface WorkingHour {
  id?: number;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
  dukkan_id?: number;
}

const gunler = [
  { id: 1, name: "Pazartesi" },
  { id: 2, name: "Salı" },
  { id: 3, name: "Çarşamba" },
  { id: 4, name: "Perşembe" },
  { id: 5, name: "Cuma" },
  { id: 6, name: "Cumartesi" },
  { id: 7, name: "Pazar" },
];

interface WorkingHoursFormProps {
  dukkanId: number | null;
}

export function WorkingHoursForm({ dukkanId }: WorkingHoursFormProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { userRole } = useCustomerAuth();

  useEffect(() => {
    if (dukkanId) {
      loadWorkingHours();
    } else {
      initializeDefaultHours();
      setLoading(false);
    }
  }, [dukkanId]);

  const loadWorkingHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('id');

      if (error) throw error;

      if (data && data.length > 0) {
        // Format time values for input
        const formattedData = data.map(hour => ({
          ...hour,
          acilis: hour.acilis ? hour.acilis.substring(0, 5) : '09:00',
          kapanis: hour.kapanis ? hour.kapanis.substring(0, 5) : '18:00',
        }));
        setWorkingHours(formattedData);
      } else {
        initializeDefaultHours();
      }
    } catch (error) {
      console.error("Çalışma saatleri yüklenirken hata:", error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
      initializeDefaultHours();
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultHours = () => {
    const defaultHours = gunler.map(gun => ({
      gun: gun.name,
      acilis: '09:00',
      kapanis: '18:00',
      kapali: gun.id === 7, // Pazar günü varsayılan olarak kapalı
      dukkan_id: dukkanId
    }));
    setWorkingHours(defaultHours);
  };

  const handleHourChange = (index: number, field: keyof WorkingHour, value: string | boolean) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    setWorkingHours(updatedHours);
  };

  const handleSave = async () => {
    if (!dukkanId) {
      toast.error("Dükkan ID bulunamadı. Lütfen önce dükkan oluşturun.");
      return;
    }

    try {
      setSaving(true);
      
      // Önce mevcut kayıtları siliyoruz (yeniden oluşturmak için)
      await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      // Şimdi güncel saatleri ekliyoruz
      const hoursWithDukkanId = workingHours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));
      
      const { error } = await supabase
        .from('calisma_saatleri')
        .insert(hoursWithDukkanId);
      
      if (error) throw error;
      
      toast.success("Çalışma saatleri başarıyla kaydedildi");
    } catch (error) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error("Çalışma saatleri kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {workingHours.map((hour, index) => (
          <Card key={index} className={hour.kapali ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{hour.gun}</h3>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`status-${index}`}
                        checked={!hour.kapali}
                        onCheckedChange={(checked) => handleHourChange(index, 'kapali', !checked)}
                        disabled={userRole !== 'admin'}
                      />
                      <Label htmlFor={`status-${index}`}>{hour.kapali ? "Kapalı" : "Açık"}</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`acilis-${index}`}>Açılış Saati</Label>
                      <Input 
                        id={`acilis-${index}`} 
                        type="time" 
                        value={hour.acilis}
                        onChange={(e) => handleHourChange(index, 'acilis', e.target.value)}
                        disabled={hour.kapali || userRole !== 'admin'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`kapanis-${index}`}>Kapanış Saati</Label>
                      <Input 
                        id={`kapanis-${index}`} 
                        type="time" 
                        value={hour.kapanis}
                        onChange={(e) => handleHourChange(index, 'kapanis', e.target.value)}
                        disabled={hour.kapali || userRole !== 'admin'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {userRole === 'admin' && (
        <Button 
          onClick={handleSave} 
          className="w-full" 
          disabled={saving}
        >
          {saving ? "Kaydediliyor..." : "Çalışma Saatlerini Kaydet"}
        </Button>
      )}
    </div>
  );
}
