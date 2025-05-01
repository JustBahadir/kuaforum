
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useWorkingHours } from "./hooks/useWorkingHours";
import { useWorkingHoursMutation } from "./hooks/useWorkingHoursMutation";
import { toast } from "sonner";

interface WorkingHoursProps {
  dukkanId?: number;
}

export function WorkingHours({ dukkanId }: WorkingHoursProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const { hours = [], isLoading, refetch } = useWorkingHours(dukkanId);
  const { saveHours, isLoading: isSaving } = useWorkingHoursMutation();
  
  // Process hours to ensure we have only one entry per day with proper Turkish capitalized names
  const processedHours = () => {
    const days = [
      { gun: "Pazartesi", gun_sira: 0 },
      { gun: "Salı", gun_sira: 1 },
      { gun: "Çarşamba", gun_sira: 2 },
      { gun: "Perşembe", gun_sira: 3 },
      { gun: "Cuma", gun_sira: 4 },
      { gun: "Cumartesi", gun_sira: 5 },
      { gun: "Pazar", gun_sira: 6 },
    ];
    
    // Create an object with one entry per day
    const daysMap = {};
    
    // Process sorted hours and take the most recent entry for each day
    [...hours].sort((a, b) => a.gun_sira - b.gun_sira).forEach(hour => {
      // Normalize day name to match our canonical names
      const normalizedName = days.find(d => 
        d.gun.toLowerCase() === hour.gun.toLowerCase() || 
        d.gun_sira === hour.gun_sira
      )?.gun;
      
      if (normalizedName) {
        daysMap[normalizedName] = hour;
      }
    });
    
    // Convert back to array using our canonical day order
    return days.map(day => {
      if (daysMap[day.gun]) {
        return {
          ...daysMap[day.gun],
          gun: day.gun // Use the properly capitalized name
        };
      } else {
        // Provide default if we don't have data for this day
        return {
          gun: day.gun,
          gun_sira: day.gun_sira,
          acilis: "09:00",
          kapanis: "18:00",
          kapali: false,
          dukkan_id: dukkanId
        };
      }
    });
  };

  // Get processed hours with normalized day names and no duplicates
  const sortedHours = processedHours();
  
  const [editableHours, setEditableHours] = useState(sortedHours);
  
  const handleEditClick = () => {
    setEditableHours(sortedHours);
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    try {
      await saveHours(editableHours);
      toast.success("Çalışma saatleri güncellendi");
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Error saving working hours:", error);
      toast.error("Çalışma saatleri kaydedilirken bir hata oluştu");
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleChange = (index: number, field: string, value: any) => {
    const updatedHours = [...editableHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setEditableHours(updatedHours);
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
  
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        {!isEditing && <Button variant="outline" onClick={handleEditClick}>Düzenle</Button>}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2">Gün</th>
                    <th className="text-left px-4 py-2">Açılış</th>
                    <th className="text-left px-4 py-2">Kapanış</th>
                    <th className="text-left px-4 py-2">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {(isEditing ? editableHours : sortedHours).map((hour, index) => (
                    <tr key={hour.gun} className="border-t">
                      <td className="px-4 py-3">{hour.gun}</td>
                      
                      {isEditing ? (
                        <>
                          <td className="px-4 py-3">
                            {!hour.kapali ? (
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
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {!hour.kapali ? (
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
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={!hour.kapali}
                                onCheckedChange={(checked) => handleChange(index, "kapali", !checked)}
                              />
                              <Label className="text-sm">
                                {hour.kapali ? "Kapalı" : "Açık"}
                              </Label>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{hour.kapali ? "-" : formatTime(hour.acilis)}</td>
                          <td className="px-4 py-3">{hour.kapali ? "-" : formatTime(hour.kapanis)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${hour.kapali ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                              {hour.kapali ? "Kapalı" : "Açık"}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {isEditing && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>İptal</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
