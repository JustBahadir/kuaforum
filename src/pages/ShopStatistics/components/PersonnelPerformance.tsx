
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function PersonnelPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personel Performansı</CardTitle>
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
