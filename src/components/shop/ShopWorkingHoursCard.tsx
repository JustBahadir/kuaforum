
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface ShopWorkingHoursCardProps {
  calisma_saatleri: any[] | null;
  userRole: string | null;
  canEdit?: boolean;
  dukkanId: number;
}

export function ShopWorkingHoursCard({ 
  calisma_saatleri, 
  userRole, 
  canEdit = false,
  dukkanId 
}: ShopWorkingHoursCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hours, setHours] = useState(() => {
    // Initialize with data or defaults
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    if (calisma_saatleri && calisma_saatleri.length > 0) {
      return calisma_saatleri.map(item => ({
        gun: item.gun,
        acilis: item.acilis || "09:00",
        kapanis: item.kapanis || "18:00",
        kapali: item.durum === "KAPALI"
      }));
    } else {
      return days.map(day => ({
        gun: day,
        acilis: "09:00",
        kapanis: "18:00",
        kapali: day === 'Pazar' // Default Sunday as closed
      }));
    }
  });

  const handleToggleDay = (index: number) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], kapali: !newHours[index].kapali };
      return newHours;
    });
  };

  const handleChangeTime = (index: number, type: 'acilis' | 'kapanis', value: string) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], [type]: value };
      return newHours;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Delete existing hours
      await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      // Insert new hours
      const { error } = await supabase
        .from('calisma_saatleri')
        .insert(
          hours.map(h => ({
            dukkan_id: dukkanId,
            gun: h.gun,
            acilis: h.kapali ? null : h.acilis,
            kapanis: h.kapali ? null : h.kapanis,
            durum: h.kapali ? 'KAPALI' : 'ACIK'
          }))
        );
      
      if (error) throw error;
      
      toast.success("Çalışma saatleri güncellendi");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        {canEdit && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Düzenle</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Çalışma Saatlerini Düzenle</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  {hours.map((day, index) => (
                    <div key={day.gun} className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-2">
                        <Label>{day.gun}</Label>
                      </div>
                      
                      {!day.kapali ? (
                        <>
                          <Select 
                            value={day.acilis} 
                            onValueChange={(value) => handleChangeTime(index, 'acilis', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Açılış" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={`open-${time}`} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={day.kapanis} 
                            onValueChange={(value) => handleChangeTime(index, 'kapanis', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kapanış" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={`close-${time}`} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleToggleDay(index)}
                          >
                            Kapalı
                          </Button>
                        </>
                      ) : (
                        <div className="col-span-3 flex items-center justify-center">
                          <span className="text-red-500 font-medium">KAPALI</span>
                        </div>
                      )}
                      
                      {day.kapali && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => handleToggleDay(index)}
                        >
                          Açık
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Güncelleniyor..." : "Kaydet"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {calisma_saatleri && calisma_saatleri.length > 0 ? (
            calisma_saatleri.map((day, index) => (
              <div key={index} className="grid grid-cols-3">
                <div className="font-medium">{day.gun}</div>
                {day.durum === 'KAPALI' ? (
                  <div className="col-span-2 text-red-500 font-medium">KAPALI</div>
                ) : (
                  <div className="col-span-2">{day.acilis} - {day.kapanis}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                Çalışma saatleri henüz tanımlanmamış.
              </p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="mt-2"
                >
                  Saatleri Tanımla
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
