
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface YearlyViewProps {
  dateRange: DateRange;
}

export function YearlyView({ dateRange }: YearlyViewProps) {
  const formattedYear = dateRange.from ? format(dateRange.from, "yyyy", { locale: tr }) : "";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yıllık Görünüm - {formattedYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Bu yıl için detaylı operasyon bilgileri burada görüntülenir.</p>
      </CardContent>
    </Card>
  );
}
