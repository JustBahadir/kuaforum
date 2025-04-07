
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShopAnalyst } from "@/components/analyst/ShopAnalyst";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface MetricsCardsProps {
  isLoading: boolean;
  totalRevenue: number;
  totalServices: number;
  uniqueCustomerCount: number;
  totalCompletedAppointments: number;
}

export function MetricsCards({
  isLoading,
  totalRevenue,
  totalServices,
  uniqueCustomerCount,
  totalCompletedAppointments
}: MetricsCardsProps) {
  const { dukkanId } = useCustomerAuth();
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Ciro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Güncel ciro bilgisi
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
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">{uniqueCustomerCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Toplam müşteri sayısı
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
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">{totalServices}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Toplam işlem sayısı
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
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(uniqueCustomerCount > 0 ? totalRevenue / uniqueCustomerCount : 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Müşteri başına ortalama
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tamamlanan Randevular
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-2xl font-bold">{totalCompletedAppointments}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Toplam tamamlanan randevu
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Analyst Component with dukkanId */}
      <ShopAnalyst dukkanId={dukkanId} />
    </div>
  );
}
