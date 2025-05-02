
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalismaSaati } from "@/lib/supabase/types";
import { gunIsimleri } from "@/components/operations/constants/workingDays";
import { sortWorkingHours } from "@/components/operations/utils/workingHoursUtils";
import { useEffect, useState } from "react";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { useNavigate } from "react-router-dom";

interface ShopWorkingHoursCardProps {
  calisma_saatleri: CalismaSaati[];
  userRole: string;
  dukkanId: number | null;
}

export function ShopWorkingHoursCard({ 
  calisma_saatleri: initialHours, 
  userRole, 
  dukkanId 
}: ShopWorkingHoursCardProps) {
  const [calismaSaatleri, setCalismaSaatleri] = useState<CalismaSaati[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialHours && initialHours.length > 0) {
      setCalismaSaatleri(sortWorkingHours(initialHours));
      return;
    }

    // If no hours provided, try to fetch them
    const loadWorkingHours = async () => {
      if (!dukkanId) return;
      
      try {
        setLoading(true);
        const hours = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        setCalismaSaatleri(sortWorkingHours(hours));
      } catch (error) {
        console.error("Failed to load working hours:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkingHours();
  }, [initialHours, dukkanId]);

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        {userRole === 'admin' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/operations")}
          >
            Düzenle
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : calismaSaatleri.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Henüz çalışma saati tanımlanmamış
          </p>
        ) : (
          <div className="space-y-2">
            {calismaSaatleri.map((saat) => (
              <div key={saat.id} className="flex justify-between py-1 border-b last:border-b-0">
                <span className="font-medium">{gunIsimleri[saat.gun]}</span>
                <span>
                  {saat.kapali 
                    ? "Kapalı" 
                    : `${formatTime(saat.acilis)} - ${formatTime(saat.kapanis)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
