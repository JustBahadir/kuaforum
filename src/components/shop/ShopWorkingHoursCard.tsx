
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { gunSiralama, gunIsimleri } from "@/components/operations/constants/workingDays";
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";

interface ShopWorkingHoursCardProps {
  calisma_saatleri?: any[];
  userRole?: string;
  dukkanId: number;
}

export function ShopWorkingHoursCard({ calisma_saatleri = [], userRole, dukkanId }: ShopWorkingHoursCardProps) {
  const { data: fetchedSaatler = [], isLoading, error, refetch } = useQuery({
    queryKey: ['dukkan_saatleri', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      try {
        const data = await calismaSaatleriServisi.hepsiniGetir(dukkanId);
        return data || [];
      } catch (err) {
        console.error("Error fetching shop working hours:", err);
        throw err;
      }
    },
    enabled: !!dukkanId,
    staleTime: 5000 // 5 seconds - refresh more frequently
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching working hours:", error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu", {
        position: "bottom-right"
      });
    }
  }, [error]);

  // Use provided hours if available, otherwise use fetched hours
  // Important: Process data to avoid duplicated
  const saatler = useMemo(() => {
    // Determine which data source to use
    const sourceData = (calisma_saatleri && calisma_saatleri.length > 0) ? 
      [...calisma_saatleri] : 
      [...fetchedSaatler];
      
    // Group by day, preferring newer entries
    const dayMap = new Map();
    sourceData.forEach(hour => {
      const existingDay = dayMap.get(hour.gun_sira);
      
      if (!existingDay || new Date(hour.created_at) > new Date(existingDay.created_at)) {
        dayMap.set(hour.gun_sira, hour);
      }
    });
    
    // Convert map back to array
    return Array.from(dayMap.values());
  }, [calisma_saatleri, fetchedSaatler]);

  // Format time display
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  // Create an array with all 7 days, filling in missing days with defaults
  const fullWeekSchedule = useMemo(() => {
    return gunSiralama.map(gun_sira => {
      const existingDay = saatler.find(day => day.gun_sira === gun_sira);
      if (existingDay) {
        return existingDay;
      }
      return {
        gun_sira,
        gun: gunIsimleri[gun_sira],
        acilis: "09:00",
        kapanis: "18:00",
        kapali: false
      };
    });
  }, [saatler]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Çalışma Saatleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Çalışma Saatleri</CardTitle>
        {userRole === 'admin' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = "/admin/operations"}
          >
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gün</TableHead>
                <TableHead className="text-right">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fullWeekSchedule.map((saat: any) => (
                <TableRow key={saat.gun_sira}>
                  <TableCell className="font-medium">
                    {saat.gun}
                  </TableCell>
                  <TableCell className="text-right">
                    {saat.kapali ? (
                      <span className="text-red-600 font-medium">KAPALI</span>
                    ) : (
                      <span>
                        {formatTime(saat.acilis)} - {formatTime(saat.kapanis)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
