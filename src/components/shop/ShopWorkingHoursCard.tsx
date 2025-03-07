
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
  calisma_saatleri: any[];
  userRole: string;
  dukkanId: number;
}

export function ShopWorkingHoursCard({ calisma_saatleri = [], userRole, dukkanId }: ShopWorkingHoursCardProps) {
  // Fetch working hours directly if not provided or empty
  const { data: fetchedSaatler = [], isLoading, error } = useQuery({
    queryKey: ['dukkan_saatleri', dukkanId],
    queryFn: async () => {
      if (!dukkanId) return [];
      console.log("Fetching working hours for shop ID:", dukkanId);
      const data = await calismaSaatleriServisi.dukkanSaatleriGetir(dukkanId);
      console.log("Fetched working hours:", data);
      return data;
    },
    enabled: !!dukkanId
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
        {sortedSaatler.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Çalışma saati bilgisi bulunmuyor.
            {userRole === 'admin' && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      await calismaSaatleriServisi.varsayilanSaatleriOlustur(dukkanId);
                      toast.success("Varsayılan çalışma saatleri oluşturuldu");
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (err) {
                      console.error("Varsayılan saatler oluşturulurken hata:", err);
                      toast.error("Varsayılan saatler oluşturulurken hata");
                    }
                  }}
                >
                  Varsayılan Saatleri Oluştur
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Gün</TableHead>
                  <TableHead>Açılış</TableHead>
                  <TableHead>Kapanış</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSaatler.map((saat: any) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
