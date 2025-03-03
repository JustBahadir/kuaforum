
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const DAYS = [
  { value: "Pazartesi", label: "Pazartesi" },
  { value: "Salı", label: "Salı" },
  { value: "Çarşamba", label: "Çarşamba" },
  { value: "Perşembe", label: "Perşembe" },
  { value: "Cuma", label: "Cuma" },
  { value: "Cumartesi", label: "Cumartesi" },
  { value: "Pazar", label: "Pazar" },
];

const HOURS = Array(14).fill(0).map((_, i) => {
  const hour = i + 8; // 8'den 21'e kadar
  return { 
    value: `${hour.toString().padStart(2, '0')}:00`, 
    label: `${hour.toString().padStart(2, '0')}:00` 
  };
});

interface WorkingHour {
  id?: number;
  gun: string;
  acilis: string;
  kapanis: string;
  kapali: boolean;
}

export function WorkingHoursForm() {
  const { dukkanId } = useCustomerAuth();
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  useEffect(() => {
    if (dukkanId) {
      loadWorkingHours();
    }
  }, [dukkanId]);

  const loadWorkingHours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .order('id');

      if (error) throw error;

      if (data.length === 0) {
        // Eğer veri yoksa, varsayılan çalışma saatlerini oluştur
        const defaultHours: WorkingHour[] = DAYS.map(day => ({
          gun: day.value,
          acilis: "09:00",
          kapanis: "18:00",
          kapali: day.value === "Pazar", // Pazar günü varsayılan olarak kapalı
        }));
        setWorkingHours(defaultHours);
        
        // Varsayılan saatleri veritabanına kaydet
        for (const hour of defaultHours) {
          await saveWorkingHour(hour);
        }
      } else {
        setWorkingHours(data);
      }
    } catch (error) {
      console.error("Çalışma saatleri yüklenirken hata:", error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const saveWorkingHour = async (dayData: WorkingHour) => {
    if (!dukkanId) return;
    
    try {
      setSavingDay(dayData.gun);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert({
          ...dayData,
          id: dayData.id, // Eğer id varsa güncelle, yoksa yeni ekle
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Güncellenmiş saatleri state'e yansıt
      setWorkingHours(prev => 
        prev.map(item => 
          item.gun === dayData.gun ? { ...item, id: data.id } : item
        )
      );
      
      toast.success(`${dayData.gun} günü çalışma saatleri güncellendi`);
    } catch (error) {
      console.error("Çalışma saatleri kaydedilirken hata:", error);
      toast.error(`${dayData.gun} günü çalışma saatleri kaydedilirken bir hata oluştu`);
    } finally {
      setSavingDay(null);
    }
  };

  const handleChangeOpen = (day: string, value: boolean) => {
    const updatedHours = workingHours.map(item => {
      if (item.gun === day) {
        return { ...item, kapali: value };
      }
      return item;
    });
    setWorkingHours(updatedHours);
    
    const dayData = updatedHours.find(item => item.gun === day);
    if (dayData) {
      saveWorkingHour(dayData);
    }
  };

  const handleChangeTime = (day: string, field: 'acilis' | 'kapanis', value: string) => {
    const updatedHours = workingHours.map(item => {
      if (item.gun === day) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setWorkingHours(updatedHours);
    
    const dayData = updatedHours.find(item => item.gun === day);
    if (dayData) {
      saveWorkingHour(dayData);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Çalışma saatleri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {DAYS.map((day) => {
          const dayData = workingHours.find(item => item.gun === day.value) || {
            gun: day.value,
            acilis: "09:00",
            kapanis: "18:00",
            kapali: false
          };
          
          const isSaving = savingDay === day.value;
          
          return (
            <div key={day.value} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{day.label}</h3>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`closed-${day.value}`} className="text-sm whitespace-nowrap">
                    Kapalı
                  </Label>
                  <Switch
                    id={`closed-${day.value}`}
                    checked={dayData.kapali}
                    onCheckedChange={(checked) => handleChangeOpen(day.value, checked)}
                    disabled={isSaving}
                  />
                </div>
                
                {!dayData.kapali && (
                  <>
                    <div className="w-24">
                      <Select
                        value={dayData.acilis}
                        onValueChange={(value) => handleChangeTime(day.value, 'acilis', value)}
                        disabled={dayData.kapali || isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Açılış" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={`open-${day.value}-${hour.value}`} value={hour.value}>
                              {hour.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <span className="text-sm">-</span>
                    
                    <div className="w-24">
                      <Select
                        value={dayData.kapanis}
                        onValueChange={(value) => handleChangeTime(day.value, 'kapanis', value)}
                        disabled={dayData.kapali || isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kapanış" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={`close-${day.value}-${hour.value}`} value={hour.value}>
                              {hour.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {isSaving && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
