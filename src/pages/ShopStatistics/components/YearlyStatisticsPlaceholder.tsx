
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

interface YearlyStatisticsPlaceholderProps {
  title?: string;
  description?: string;
}

export function YearlyStatisticsPlaceholder({ 
  title = "Veri Hazırlanıyor", 
  description = "Yeterli veri bulunmuyor. Daha sonra tekrar kontrol edin."
}: YearlyStatisticsPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Bilgi</AlertTitle>
          <AlertDescription>
            {description}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
