
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkingHoursForm } from "./WorkingHoursForm";
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";

interface WorkingHoursProps {
  dukkanId?: number;
}

export function WorkingHours({ dukkanId }: WorkingHoursProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: hours = [], isLoading, refetch } = useQuery({
    queryKey: ['workingHours', dukkanId],
    queryFn: async () => {
      if (!dukkanId) {
        const fetchedDukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
        if (!fetchedDukkanId) {
          throw new Error('Dükkan bilgisi bulunamadı');
        }
        return calismaSaatleriServisi.hepsiniGetir(fetchedDukkanId);
      }
      return calismaSaatleriServisi.hepsiniGetir(dukkanId);
    }
  });

  const handleEditClick = () => {
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Çalışma Saatleri</CardTitle>
          <Button variant="outline" onClick={handleEditClick}>Düzenle</Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : sortedHours.length > 0 ? (
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
                    {sortedHours.map((hour) => (
                      <tr key={hour.gun} className="border-t">
                        <td className="px-4 py-3">{hour.gun}</td>
                        <td className="px-4 py-3">{hour.kapali ? "-" : hour.acilis}</td>
                        <td className="px-4 py-3">{hour.kapali ? "-" : hour.kapanis}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${hour.kapali ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                            {hour.kapali ? "Kapalı" : "Açık"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Çalışma saatleri ayarlanmamış
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Çalışma Saatlerini Düzenle</DialogTitle>
          </DialogHeader>
          <WorkingHoursForm onClose={() => setIsFormOpen(false)} onSave={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
