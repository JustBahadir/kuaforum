
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

export function YearlyStatisticsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Yıllık İstatistikler</CardTitle>
      </CardHeader>
      <CardContent className="py-8">
        <Alert>
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Yeterli veri bulunamadı</AlertTitle>
          <AlertDescription>
            Yıllık istatistikleri görebilmek için en az 1 yıllık veri gerekiyor. 
            Şu anda yeterli veriye sahip değilsiniz. Daha fazla veri oluştukça, yıllık istatistikler 
            burada görüntülenecektir.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
