
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { toast } from "sonner";
import { useShopData } from "@/hooks/useShopData";

interface WorkingHoursFormProps {
  onClose: () => void;
  onSave?: () => void;
}

export function WorkingHoursForm({ onClose, onSave }: WorkingHoursFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState<any[]>([]);
  const { isletmeData } = useShopData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let dukkanId = isletmeData?.id;
        
        // If we don't have dukkanId from isletmeData, try to get it from getCurrentDukkanId
        if (!dukkanId) {
          dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
        }
        
        if (!dukkanId) {
          throw new Error("İşletme bilgisi bulunamadı");
        }

        const data = await calismaSaatleriServisi.hepsiniGetir(dukkanId);
        
        // Make sure we have all days with proper Turkish capitalization
        const days = [
          { gun: "Pazartesi", gun_sira: 0 },
          { gun: "Salı", gun_sira: 1 },
          { gun: "Çarşamba", gun_sira: 2 },
          { gun: "Perşembe", gun_sira: 3 },
          { gun: "Cuma", gun_sira: 4 },
          { gun: "Cumartesi", gun_sira: 5 },
          { gun: "Pazar", gun_sira: 6 },
        ];
        
        // Create an object with entries for existing days
        const existingDays = {};
        data.forEach(day => {
          // Find the canonical day name
          const canonicalDay = days.find(d => 
            d.gun.toLowerCase() === day.gun.toLowerCase() || 
            d.gun_sira === day.gun_sira
          );
          
          if (canonicalDay) {
            existingDays[canonicalDay.gun] = {
              ...day,
              gun: canonicalDay.gun // Use properly capitalized name
            };
          }
        });
        
        // Fill in missing days with default values
        const hoursWithAllDays = days.map(day => {
          if (existingDays[day.gun]) {
            return existingDays[day.gun];
          } else {
            return {
              id: undefined,
              gun: day.gun,
              gun_sira: day.gun_sira,
              dukkan_id: dukkanId,
              acilis: "09:00",
              kapanis: "18:00",
              kapali: false,
            };
          }
        });
        
        setHours(hoursWithAllDays);
      } catch (error: any) {
        console.error("Error fetching working hours:", error);
        setError(error.message || "Çalışma saatleri yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isletmeData]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let dukkanId = isletmeData?.id;
      
      // If we don't have dukkanId from isletmeData, try to get it from getCurrentDukkanId
      if (!dukkanId) {
        dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
      }
      
      if (!dukkanId) {
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      // Save all hours
      for (const hour of hours) {
        if (hour.id) {
          // Update existing
          await calismaSaatleriServisi.guncelle(hour.id, {
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali,
          });
        } else {
          // Create new
          await calismaSaatleriServisi.ekle({
            gun: hour.gun,
            gun_sira: hour.gun_sira,
            dukkan_id: dukkanId,
            acilis: hour.acilis,
            kapanis: hour.kapanis,
            kapali: hour.kapali,
          });
        }
      }
      
      toast.success("Çalışma saatleri güncellendi");
      if (onSave) onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving working hours:", error);
      toast.error(error.message || "Çalışma saatleri kaydedilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updatedHours = [...hours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setHours(updatedHours);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min of ["00", "30"]) {
        const time = `${hour.toString().padStart(2, "0")}:${min}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {hours.map((hour, index) => (
          <div key={hour.gun} className="flex items-center justify-between border-b pb-4">
            <div className="font-medium w-24">{hour.gun}</div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={!hour.kapali}
                onCheckedChange={(checked) => handleChange(index, "kapali", !checked)}
              />
              <Label htmlFor={`day-${index}`} className="text-sm">
                {hour.kapali ? "Kapalı" : "Açık"}
              </Label>
            </div>
            
            {!hour.kapali && (
              <div className="flex items-center space-x-2">
                <Select
                  value={hour.acilis}
                  onValueChange={(value) => handleChange(index, "acilis", value)}
                  disabled={hour.kapali}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Açılış" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`open-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>-</span>
                <Select
                  value={hour.kapanis}
                  onValueChange={(value) => handleChange(index, "kapanis", value)}
                  disabled={hour.kapali}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Kapanış" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={`close-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}
