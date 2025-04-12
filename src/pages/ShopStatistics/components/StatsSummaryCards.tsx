
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface StatsSummaryCardsProps {
  data: any;
  isLoading: boolean;
}

export function StatsSummaryCards({ data, isLoading }: StatsSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <CardHeader className="pb-2 opacity-50">
              <CardTitle className="text-base font-medium">Yükleniyor...</CardTitle>
            </CardHeader>
            <CardContent className="opacity-50">
              <div className="h-8"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const operations = data?.operations || [];
  const totalOperations = operations.length;
  const totalRevenue = operations.reduce((sum: number, op: any) => sum + (op.tutar || 0), 0);
  const averageRevenue = totalOperations > 0 ? totalRevenue / totalOperations : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Toplam İşlem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalOperations}</div>
          <p className="text-sm text-muted-foreground">
            Seçili tarih aralığında
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Toplam Ciro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-sm text-muted-foreground">
            Seçili tarih aralığında
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Ortalama İşlem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(averageRevenue)}
          </div>
          <p className="text-sm text-muted-foreground">İşlem başına</p>
        </CardContent>
      </Card>
    </div>
  );
}
