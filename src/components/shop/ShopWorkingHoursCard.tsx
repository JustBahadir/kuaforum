
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { gunSiralama, gunIsimleri } from "@/components/operations/constants/workingDays";
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ShopWorkingHoursCardProps {
  calisma_saatleri?: any[];
  userRole?: string;
  dukkanId: number;
}

export function ShopWorkingHoursCard({ calisma_saatleri = [], userRole, dukkanId }: ShopWorkingHoursCardProps) {
  const [displayedHours, setDisplayedHours] = useState<any[]>([]);
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
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
    }
  }, [error]);

  // Set displayed hours whenever source data changes
  useEffect(() => {
    // Use provided hours if available, otherwise use fetched hours
    const saatler = calisma_saatleri.length > 0 ? calisma_saatleri : fetchedSaatler;
    
    // Ensure the days are sorted correctly
    const sortedSaatler = [...saatler].sort((a, b) => {
      return a.gun_sira - b.gun_sira;
    });
    
    // Remove any duplicate days that might have been created by mistake
    const uniqueDays = sortedSaatler.reduce((acc, current) => {
      const existingDay = acc.find(day => day.gun_sira === current.gun_sira);
      if (!existingDay) {
        acc.push(current);
      }
      return acc;
    }, [] as any[]);
    
    setDisplayedHours(uniqueDays);
  }, [calisma_saatleri, fetchedSaatler]);

  // Format time display
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

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
              {displayedHours.length > 0 ? displayedHours.map((saat: any) => (
                <TableRow key={saat.gun_sira}>
                  <TableCell className="font-medium">
                    {/* Use proper capitalized Turkish day names */}
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
              )) : (
                // Fallback for when no schedule is available
                gunSiralama.map((gun_sira, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {gunIsimleri[gun_sira]}
                    </TableCell>
                    <TableCell className="text-right">
                      <span>09:00 - 18:00</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
