
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ShopWorkingHoursCardProps {
  calisma_saatleri: any[];
  userRole: string;
  gunIsimleri: Record<string, string>;
}

export function ShopWorkingHoursCard({ calisma_saatleri, userRole, gunIsimleri }: ShopWorkingHoursCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "Kapalı";
    return time.substring(0, 5);
  };

  // Correct order for Turkish days
  const gunSirasi = {
    "pazartesi": 1,
    "sali": 2,
    "carsamba": 3,
    "persembe": 4,
    "cuma": 5,
    "cumartesi": 6,
    "pazar": 7
  };

  // Make a sorted copy of the working hours
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
        <div className="space-y-4">
          {sortedSaatler.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Çalışma saati bilgisi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSaatler.map((saat: any) => (
                <div key={saat.gun} className="flex justify-between py-2 border-b">
                  <span className="font-medium">{gunIsimleri[saat.gun] || saat.gun}</span>
                  <span>
                    {saat.kapali 
                      ? "Kapalı" 
                      : `${formatTime(saat.acilis)} - ${formatTime(saat.kapanis)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
