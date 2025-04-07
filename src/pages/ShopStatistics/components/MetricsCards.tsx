
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MetricsCardsProps {
  totalRevenue: number;
  totalServices: number;
  uniqueCustomerCount: number;
  totalCompletedAppointments: number;
  isLoading: boolean;
}

export function MetricsCards({
  totalRevenue,
  totalServices,
  uniqueCustomerCount,
  totalCompletedAppointments,
  isLoading
}: MetricsCardsProps) {
  
  // Calculate average spending
  const averageSpending = uniqueCustomerCount > 0 
    ? totalRevenue / uniqueCustomerCount 
    : 0;
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-gray-200 rounded animate-pulse"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <p className="h-3 bg-gray-100 w-2/3 rounded animate-pulse"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Ciro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Toplam gelir
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Müşteri Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCustomerCount}</div>
          <p className="text-xs text-muted-foreground">
            Tekil müşteri sayısı
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            İşlem Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServices}</div>
          <p className="text-xs text-muted-foreground">
            Toplam hizmet adedi
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ortalama Harcama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageSpending)}</div>
          <p className="text-xs text-muted-foreground">
            Müşteri başına
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Randevu Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompletedAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Tamamlanan randevular
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
