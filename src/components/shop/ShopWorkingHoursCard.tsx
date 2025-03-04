
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
          {calisma_saatleri.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Çalışma saati bilgisi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2">
              {calisma_saatleri.map((saat: any) => (
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
