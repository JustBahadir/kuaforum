
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface WeeklyViewProps {
  dateRange: DateRange;
}

export function WeeklyView({ dateRange }: WeeklyViewProps) {
  const formattedStartDate = dateRange.from ? format(dateRange.from, "d MMMM", { locale: tr }) : "";
  const formattedEndDate = dateRange.to ? format(dateRange.to, "d MMMM yyyy", { locale: tr }) : "";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Görünüm - {formattedStartDate} - {formattedEndDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Bu hafta için detaylı operasyon bilgileri burada görüntülenir.</p>
      </CardContent>
    </Card>
  );
}
