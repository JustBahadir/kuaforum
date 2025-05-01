
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface WorkingHour {
  id: number;
  gun: string;
  gun_sira: number;
  acilis: string;
  kapanis: string;
  kapali: boolean;
  dukkan_id: number;
}

export function WorkingHours() {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("18:00");
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const turkishDays = [
    { day: "pazartesi", label: "Pazartesi", sira: 1 },
    { day: "sali", label: "Salı", sira: 2 },
    { day: "carsamba", label: "Çarşamba", sira: 3 },
    { day: "persembe", label: "Perşembe", sira: 4 },
    { day: "cuma", label: "Cuma", sira: 5 },
    { day: "cumartesi", label: "Cumartesi", sira: 6 },
    { day: "pazar", label: "Pazar", sira: 7 },
  ];

  // Fetch working hours data from DB
  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        // First get the current user's dukkan_id
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Oturum bilgileri alınamadı');
          setLoading(false);
          return;
        }
        
        // Check if user is admin
        const role = user.user_metadata?.role;
        let dukkanId = null;
        
        if (role === 'admin') {
          // Admin user - get dukkan by user_id
          const { data: dukkanData, error: dukkanError } = await supabase
            .from('dukkanlar')
            .select('id')
            .eq('sahibi_id', user.id)
            .single();
            
          if (!dukkanError && dukkanData) {
            dukkanId = dukkanData.id;
          }
        } else if (role === 'staff') {
          // Staff user - get dukkan through personeller
          const { data: staffData, error: staffError } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', user.id)
            .single();
            
          if (!staffError && staffData) {
            dukkanId = staffData.dukkan_id;
          }
        }
        
        if (!dukkanId) {
          toast.error('İşletme bilgisi bulunamadı');
          setLoading(false);
          return;
        }
        
        // Now get working hours for the dukkan
        const { data, error } = await supabase
          .from('calisma_saatleri')
          .select('*')
          .eq('dukkan_id', dukkanId)
          .order('gun_sira');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setWorkingHours(data);
        } else {
          // Create default working hours if none exist
          const defaultHours = await createDefaultWorkingHours(dukkanId);
          setWorkingHours(defaultHours);
        }
      } catch (error) {
        console.error('Error fetching working hours:', error);
        toast.error('Çalışma saatleri alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, []);

  const createDefaultWorkingHours = async (dukkanId: number) => {
    try {
      const defaultHours = turkishDays.map(({ day, sira }) => ({
        gun: day,
        gun_sira: sira,
        dukkan_id: dukkanId,
        acilis: '09:00',
        kapanis: '18:00',
        kapali: day === 'pazar', // Sunday closed by default
      }));

      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(defaultHours)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating default working hours:', error);
      toast.error('Varsayılan çalışma saatleri oluşturulamadı');
      return [];
    }
  };

  const startEditing = (day: string) => {
    const dayData = workingHours.find(hour => hour.gun === day);
    
    if (dayData) {
      setEditingDay(day);
      setOpeningTime(dayData.acilis || '09:00');
      setClosingTime(dayData.kapanis || '18:00');
      setIsClosed(dayData.kapali || false);
    }
  };

  const saveWorkingHours = async () => {
    if (!editingDay) return;
    
    try {
      setSaving(true);
      
      const dayData = workingHours.find(hour => hour.gun === editingDay);
      
      if (dayData) {
        const updatedData = {
          acilis: isClosed ? null : openingTime,
          kapanis: isClosed ? null : closingTime,
          kapali: isClosed
        };

        const { error } = await supabase
          .from('calisma_saatleri')
          .update(updatedData)
          .eq('id', dayData.id);

        if (error) throw error;

        // Update local state
        setWorkingHours(prev => prev.map(hour => 
          hour.gun === editingDay 
            ? { ...hour, ...updatedData } 
            : hour
        ));
        
        toast.success('Çalışma saatleri güncellendi');
        setEditingDay(null);
      }
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast.error('Çalışma saatleri güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditingDay(null);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Çalışma Saatleri</h2>
      
      <div className="grid gap-4">
        {turkishDays.map(({ day, label }) => {
          const hourData = workingHours.find(h => h.gun === day) || {
            acilis: '09:00', 
            kapanis: '18:00',
            kapali: false
          };
          
          const isEditing = editingDay === day;
          const isClosed = hourData.kapali;

          return (
            <div key={day} className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{label}</h3>
                  {!isEditing && (
                    <p className="text-sm text-gray-600">
                      {isClosed ? (
                        <span className="text-red-500">Kapalı</span>
                      ) : (
                        `${hourData.acilis || '09:00'} - ${hourData.kapanis || '18:00'}`
                      )}
                    </p>
                  )}
                </div>
                
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => startEditing(day)}
                  >
                    Düzenle
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`closed-${day}`}
                        checked={isClosed}
                        onCheckedChange={setIsClosed}
                      />
                      <Label htmlFor={`closed-${day}`}>Kapalı</Label>
                    </div>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4 space-y-4">
                  {!isClosed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`opening-${day}`}>Açılış Saati</Label>
                        <Select 
                          value={openingTime}
                          onValueChange={setOpeningTime}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Açılış saati" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={`open-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`closing-${day}`}>Kapanış Saati</Label>
                        <Select 
                          value={closingTime}
                          onValueChange={setClosingTime}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kapanış saati" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={`close-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                      İptal
                    </Button>
                    <Button onClick={saveWorkingHours} disabled={saving}>
                      {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
