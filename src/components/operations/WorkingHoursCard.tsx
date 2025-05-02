
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CalismaSaati } from "@/lib/supabase/types";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { WorkingHoursTable } from "./working-hours/WorkingHoursTable";
import { sortWorkingHours } from "./utils/workingHoursUtils";
import { toast } from "sonner";

export function WorkingHoursCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState<CalismaSaati[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
        const fetchedHours = await calismaSaatleriServisi.hepsiniGetir(dukkanId);
        
        setHours(sortWorkingHours(fetchedHours));
      } catch (err: any) {
        console.error("Error fetching working hours:", err);
        setError(err?.message || "Çalışma saatleri yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkingHours();
  }, []);
  
  const handleTimeChange = (index: number, field: "acilis" | "kapanis", value: string) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], [field]: value };
      return newHours;
    });
  };
  
  const handleStatusChange = (index: number, value: boolean) => {
    setHours(prevHours => {
      const newHours = [...prevHours];
      newHours[index] = { ...newHours[index], kapali: value };
      return newHours;
    });
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Update existing hours or add new ones
      for (const hour of hours) {
        if (hour.id) {
          await calismaSaatleriServisi.guncelle(hour.id, hour);
        } else {
          await calismaSaatleriServisi.ekle(hour);
        }
      }
      
      toast.success("Çalışma saatleri başarıyla kaydedildi");
      setEditingMode(false);
    } catch (error) {
      console.error("Failed to save working hours:", error);
      toast.error("Çalışma saatlerini kaydederken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // Reload hours from server to discard changes
    setEditingMode(false);
    fetchWorkingHours();
  };
  
  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      const dukkanId = await calismaSaatleriServisi.getCurrentDukkanId();
      const fetchedHours = await calismaSaatleriServisi.hepsiniGetir(dukkanId);
      setHours(sortWorkingHours(fetchedHours));
    } catch (err) {
      console.error("Error fetching working hours:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Çalışma Saatleri</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Çalışma Saatleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => fetchWorkingHours()} className="mt-4">
              Yeniden Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Çalışma Saatleri</CardTitle>
          <CardDescription>
            İşletmenizin çalışma saatlerini düzenleyebilirsiniz.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {editingMode ? (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancel}
                disabled={loading}
              >
                İptal
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSave}
                disabled={loading}
              >
                Kaydet
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setEditingMode(true)}
            >
              Düzenle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <WorkingHoursTable 
          hours={hours}
          editingMode={editingMode}
          onTimeChange={handleTimeChange}
          onStatusChange={handleStatusChange}
        />
      </CardContent>
    </Card>
  );
}
