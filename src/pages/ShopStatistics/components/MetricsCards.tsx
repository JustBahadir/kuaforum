
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">Toplam Ciro</p>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          )}
          <p className="text-xs text-muted-foreground">Güncel ciro bilgisi</p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">Müşteri Sayısı</p>
          {isLoading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <p className="text-2xl font-bold">{uniqueCustomerCount}</p>
          )}
          <p className="text-xs text-muted-foreground">Toplam müşteri sayısı</p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">İşlem Sayısı</p>
          {isLoading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <p className="text-2xl font-bold">{totalServices}</p>
          )}
          <p className="text-xs text-muted-foreground">Toplam işlem sayısı</p>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">Tamamlanan Randevular</p>
          {isLoading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <p className="text-2xl font-bold">{totalCompletedAppointments}</p>
          )}
          <p className="text-xs text-muted-foreground">Toplam tamamlanan randevu</p>
        </div>
      </div>
    </div>
  );
}
