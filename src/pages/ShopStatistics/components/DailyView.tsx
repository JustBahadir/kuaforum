
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface DailyViewProps {
  dateRange: DateRange;
}

export function DailyView({ dateRange }: DailyViewProps) {
  const formattedDate = dateRange.from ? format(dateRange.from, "d MMMM yyyy", { locale: tr }) : "";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Günlük Görünüm - {formattedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Bu tarih için detaylı operasyon bilgileri burada görüntülenir.</p>
      </CardContent>
    </Card>
  );
}
