
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CalismaSaati } from "@/lib/supabase/types";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { gunSiralama } from "./constants/workingDays";

export function WorkingHoursForm() {
  const { dukkanId } = useCustomerAuth();
  const [workingHours, setWorkingHours] = useState<CalismaSaati[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalHours, setOriginalHours] = useState<CalismaSaati[]>([]);

  useEffect(() => {
    if (dukkanId) {
      loadWorkingHours();
    }
  }, [dukkanId]);

  const loadWorkingHours = async () => {
    if (!dukkanId) return;
    
    try {
      setIsLoading(true);
      const hours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      // Sort by day order
      const sortedHours = [...hours].sort((a, b) => {
        return gunSiralama.indexOf(a.gun) - gunSiralama.indexOf(b.gun);
      });
      setWorkingHours(sortedHours);
      setOriginalHours(JSON.parse(JSON.stringify(sortedHours))); // Deep copy for reset
    } catch (error) {
      console.error("Çalışma saatleri yüklenirken hata:", error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setWorkingHours(JSON.parse(JSON.stringify(originalHours))); // Restore from backup
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!dukkanId) {
      toast.error("Dükkan bilgisi bulunamadı");
      return;
    }
    
    try {
      // Make sure all entries have dukkan_id
      const hoursWithShopId = workingHours.map(hour => ({
        ...hour,
        dukkan_id: dukkanId
      }));
      
      const result = await calismaSaatleriServisi.dukkanSaatleriKaydet(hoursWithShopId);
      
      if (result && result.length > 0) {
        toast.success("Çalışma saatleri başarıyla güncellendi");
        setWorkingHours(result);
        setOriginalHours(JSON.parse(JSON.stringify(result)));
        setIsEditing(false);
      } else {
        toast.error("Çalışma saatleri güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Çalışma saatleri güncellenirken hata:", error);
      toast.error("Çalışma saatleri güncellenirken bir hata oluştu");
    }
  };

  const handleOpeningTimeChange = (index: number, time: string) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = { ...updatedHours[index], acilis: time };
    setWorkingHours(updatedHours);
  };

  const handleClosingTimeChange = (index: number, time: string) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = { ...updatedHours[index], kapanis: time };
    setWorkingHours(updatedHours);
  };

  const handleStatusChange = (index: number, closed: boolean) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = { 
      ...updatedHours[index], 
      kapali: closed,
      acilis: closed ? null : (updatedHours[index].acilis || "09:00"),
      kapanis: closed ? null : (updatedHours[index].kapanis || "19:00")
    };
    setWorkingHours(updatedHours);
  };

  const getDayName = (dayCode: string) => {
    const dayMap: Record<string, string> = {
      pazartesi: "Pazartesi",
      sali: "Salı",
      carsamba: "Çarşamba",
      persembe: "Perşembe",
      cuma: "Cuma",
      cumartesi: "Cumartesi",
      pazar: "Pazar"
    };
    return dayMap[dayCode] || dayCode;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Çalışma Saatleri</h2>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="border rounded-md">
          <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted">
            <div className="font-medium">Gün</div>
            <div className="font-medium">Açılış</div>
            <div className="font-medium">Kapanış</div>
            <div className="font-medium text-right">Durum</div>
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Çalışma Saatleri</h2>
        
        {isEditing ? (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              İptal
            </Button>
            <Button onClick={handleSave}>
              Kaydet
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Düzenle
          </Button>
        )}
      </div>
      
      <div className="border rounded-md">
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted">
          <div className="font-medium">Gün</div>
          <div className="font-medium">Açılış</div>
          <div className="font-medium">Kapanış</div>
          <div className="font-medium text-right">Durum</div>
        </div>
        
        {workingHours.map((day, index) => (
          <div key={day.gun} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 items-center">
            <div>{getDayName(day.gun)}</div>
            
            <div>
              {isEditing ? (
                <Input
                  type="time"
                  value={day.acilis || ""}
                  onChange={(e) => handleOpeningTimeChange(index, e.target.value)}
                  disabled={day.kapali}
                  className="w-full"
                />
              ) : (
                <span>{day.kapali ? "-" : day.acilis}</span>
              )}
            </div>
            
            <div>
              {isEditing ? (
                <Input
                  type="time"
                  value={day.kapanis || ""}
                  onChange={(e) => handleClosingTimeChange(index, e.target.value)}
                  disabled={day.kapali}
                  className="w-full"
                />
              ) : (
                <span>{day.kapali ? "-" : day.kapanis}</span>
              )}
            </div>
            
            <div className="flex justify-end items-center">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={day.kapali}
                    onCheckedChange={(checked) => handleStatusChange(index, checked)}
                  />
                  <Label className="text-sm">{day.kapali ? "Kapalı" : "Açık"}</Label>
                </div>
              ) : (
                <span className={day.kapali ? "text-red-500" : "text-green-600"}>
                  {day.kapali ? "Kapalı" : "Açık"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
