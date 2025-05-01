
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClockIcon } from "lucide-react";
import { useWorkingHours } from "../operations/hooks/useWorkingHours";
import { useWorkingHoursMutation } from "../operations/hooks/useWorkingHoursMutation";
import { toast } from "sonner";

interface WorkingHoursProps {
  dukkanId?: number;
  isStaff?: boolean;
}

export function WorkingHours({ dukkanId, isStaff = false }: WorkingHoursProps) {
  // Local state for managing working hours
  const [localHours, setLocalHours] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch working hours data
  const { workingHours, isLoading, error, refetch } = useWorkingHours(dukkanId);
  
  // Mutation for saving hours
  const { saveHours, isLoading: isSaving } = useWorkingHoursMutation({
    dukkanId: dukkanId || 0,
    onMutationSuccess: () => {
      toast.success("Çalışma saatleri başarıyla kaydedildi");
      refetch();
      setHasChanges(false);
    }
  });
  
  // Initialize local hours when workingHours loads
  useEffect(() => {
    if (workingHours && workingHours.length > 0) {
      setLocalHours([...workingHours]);
    } else {
      // Default hours if none exist
      setLocalHours([
        { gun: "Pazartesi", gun_sira: 1, kapali: false, acilis: "09:00", kapanis: "18:00" },
        { gun: "Salı", gun_sira: 2, kapali: false, acilis: "09:00", kapanis: "18:00" },
        { gun: "Çarşamba", gun_sira: 3, kapali: false, acilis: "09:00", kapanis: "18:00" },
        { gun: "Perşembe", gun_sira: 4, kapali: false, acilis: "09:00", kapanis: "18:00" },
        { gun: "Cuma", gun_sira: 5, kapali: false, acilis: "09:00", kapanis: "18:00" },
        { gun: "Cumartesi", gun_sira: 6, kapali: false, acilis: "09:00", kapanis: "17:00" },
        { gun: "Pazar", gun_sira: 7, kapali: true, acilis: "09:00", kapanis: "17:00" }
      ]);
    }
  }, [workingHours]);
  
  // Update a specific day's hours
  const updateDay = (index: number, field: 'acilis' | 'kapanis' | 'kapali', value: string | boolean) => {
    const newHours = [...localHours];
    newHours[index] = {
      ...newHours[index],
      [field]: value
    };
    setLocalHours(newHours);
    setHasChanges(true);
  };
  
  // Handle save
  const handleSave = async () => {
    await saveHours(localHours);
  };
  
  // Reset hours to last saved state
  const resetHours = () => {
    if (workingHours && workingHours.length > 0) {
      setLocalHours([...workingHours]);
    }
    setHasChanges(false);
  };
  
  // Generate hour options (6:00 to 23:30 in 30-minute increments)
  const hourOptions = [];
  for (let hour = 6; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      hourOptions.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Çalışma saatleri yüklenirken bir hata oluştu.</p>
        <Button onClick={() => refetch()} className="mt-2">Tekrar Dene</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" /> Çalışma Saatleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localHours.map((day, index) => (
            <div key={day.gun} className="flex items-center space-x-4 p-2 hover:bg-muted/50 rounded-md">
              <div className="w-32">
                <p className="font-medium">{day.gun}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={!day.kapali} 
                  onCheckedChange={(checked) => updateDay(index, 'kapali', !checked)}
                />
                <Label>Açık</Label>
              </div>
              {!day.kapali && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-1 block">Açılış</Label>
                      <Select
                        value={day.acilis || "09:00"}
                        onValueChange={(value) => updateDay(index, 'acilis', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Açılış saati" />
                        </SelectTrigger>
                        <SelectContent>
                          {hourOptions.map(time => (
                            <SelectItem key={`open-${day.gun}-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Kapanış</Label>
                      <Select
                        value={day.kapanis || "18:00"}
                        onValueChange={(value) => updateDay(index, 'kapanis', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Kapanış saati" />
                        </SelectTrigger>
                        <SelectContent>
                          {hourOptions.map(time => (
                            <SelectItem key={`close-${day.gun}-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      {(hasChanges || isStaff) && (
        <CardFooter className="flex justify-end space-x-2 border-t p-4">
          {hasChanges && (
            <Button variant="outline" onClick={resetHours} disabled={isSaving}>
              Değişiklikleri İptal Et
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
