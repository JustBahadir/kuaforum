
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function YearlyStatisticsPlaceholder() {
  return (
    <Card>
      <CardContent className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Yeterli veri bulunmadığından istatistik gösterilemiyor. Lütfen daha sonra tekrar deneyiniz.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
