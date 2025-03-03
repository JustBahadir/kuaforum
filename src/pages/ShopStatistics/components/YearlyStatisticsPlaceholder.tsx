
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

export function YearlyStatisticsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Veri Hazırlanıyor</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Bilgi</AlertTitle>
          <AlertDescription>
            Yıllık istatistik verileri henüz hazır değil. Daha sonra tekrar kontrol edin.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
