
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Switch } from "@/components/ui/switch";
import { gunSirasi, gunIsimleri } from "@/components/operations/constants/workingDays";

interface ShopWorkingHoursCardProps {
  calisma_saatleri: any[];
  userRole: string;
}

export function ShopWorkingHoursCard({ calisma_saatleri, userRole }: ShopWorkingHoursCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  // Sort days from Monday to Sunday
  const sortedSaatler = [...calisma_saatleri].sort((a, b) => {
    const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
    const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
    return aIndex - bIndex;
  });

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
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Gün</TableHead>
                  <TableHead>Açılış</TableHead>
                  <TableHead>Kapanış</TableHead>
                  <TableHead>Durum</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!saat.kapali}
                          disabled={true}
                        />
                        <span className="text-sm text-gray-600">
                          {saat.kapali ? "Kapalı" : "Açık"}
                        </span>
                      </div>
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
