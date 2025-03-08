
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { gunSiralama, gunIsimleri } from "@/components/operations/constants/workingDays";
import { useQuery } from "@tanstack/react-query";
import { calismaSaatleriServisi } from "@/lib/supabase/services/calismaSaatleriServisi";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";

interface ShopWorkingHoursCardProps {
  calisma_saatleri?: any[];
  userRole?: string;
  dukkanId: number;
}

export function ShopWorkingHoursCard({ calisma_saatleri = [], userRole, dukkanId }: ShopWorkingHoursCardProps) {
  // Fetch working hours directly if not provided or empty
  const { data: fetchedSaatler = [], isLoading, error } = useQuery({
    queryKey: ['dukkan_saatleri', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      
      try {
        const data = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
        return data;
      } catch (err) {
        console.error("Error fetching shop working hours:", err);
        throw err;
      }
    },
    enabled: !!dukkanId && calisma_saatleri.length === 0,
    staleTime: 30000 // 30 seconds
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching working hours:", error);
      toast.error("Çalışma saatleri yüklenirken bir hata oluştu");
    }
  }, [error]);

  // Use provided hours if available, otherwise use fetched hours
  const saatler = calisma_saatleri.length > 0 ? calisma_saatleri : fetchedSaatler;

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  // Always sort days based on our predefined array order
  const sortedSaatler = [...saatler].sort((a, b) => {
    const aIndex = gunSiralama.indexOf(a.gun);
    const bIndex = gunSiralama.indexOf(b.gun);
    return aIndex - bIndex;
  });

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
                <TableHead className="w-[150px]">Gün</TableHead>
                <TableHead>Açılış</TableHead>
                <TableHead>Kapanış</TableHead>
                <TableHead className="text-right">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSaatler.length === 0 ? (
                gunSiralama.map((gun) => (
                  <TableRow key={gun} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{gunIsimleri[gun]}</TableCell>
                    <TableCell>09:00</TableCell>
                    <TableCell>19:00</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Açık
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                sortedSaatler.map((saat: any) => (
                  <TableRow key={saat.gun} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {gunIsimleri[saat.gun] || saat.gun}
                    </TableCell>
                    <TableCell>
                      {saat.kapali ? "-" : formatTime(saat.acilis)}
                    </TableCell>
                    <TableCell>
                      {saat.kapali ? "-" : formatTime(saat.kapanis)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        saat.kapali ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {saat.kapali ? "Kapalı" : "Açık"}
                      </span>
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
