
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DailyViewProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function DailyView({ dateRange }: DailyViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Günlük İstatistikler</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu modül şu anda hazırlanıyor. Çok yakında kullanıma sunulacaktır.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
