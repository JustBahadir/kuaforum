
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface MonthlyViewProps {
  dateRange: DateRange;
}

export function MonthlyView({ dateRange }: MonthlyViewProps) {
  const formattedMonth = dateRange.from ? format(dateRange.from, "MMMM yyyy", { locale: tr }) : "";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylık Görünüm - {formattedMonth}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Bu ay için detaylı operasyon bilgileri burada görüntülenir.</p>
      </CardContent>
    </Card>
  );
}
