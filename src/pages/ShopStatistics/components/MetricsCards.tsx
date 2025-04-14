
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, Calendar, AlertCircle, UserPlus, Award } from "lucide-react";

interface MetricsCardsProps {
  totalRevenue: number;
  totalServices: number;
  uniqueCustomerCount: number;
  totalCompletedAppointments: number;
  cancelledAppointments?: number;
  newCustomers?: number;
  loyalCustomers?: number;
  isLoading: boolean;
}

export function MetricsCards({
  totalRevenue,
  totalServices,
  uniqueCustomerCount,
  totalCompletedAppointments,
  cancelledAppointments = 0,
  newCustomers = 0,
  loyalCustomers = 0,
  isLoading
}: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yükleniyor...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
              <p className="text-xs text-muted-foreground mt-2">
                <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const avgRevenuePerService = totalServices > 0 
    ? totalRevenue / totalServices 
    : 0;

  const cancelRate = totalCompletedAppointments + cancelledAppointments > 0 
    ? (cancelledAppointments / (totalCompletedAppointments + cancelledAppointments)) * 100 
    : 0;

  const customerLoyaltyRate = uniqueCustomerCount > 0 
    ? (loyalCustomers / uniqueCustomerCount) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Ciro
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            İşlem Başına: {formatCurrency(avgRevenuePerService)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Müşteri Sayısı
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCustomerCount}</div>
          <p className="text-xs text-muted-foreground">
            {newCustomers > 0 && `Yeni: +${newCustomers} müşteri`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam İşlem
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServices}</div>
          <p className="text-xs text-muted-foreground">
            Tamamlanan randevu: {totalCompletedAppointments}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            İptal Oranı
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            %{cancelRate.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">
            İptal Edilen: {cancelledAppointments} randevu
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Yeni Müşteriler
          </CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Toplam müşterilerin %{uniqueCustomerCount > 0 ? Math.round((newCustomers / uniqueCustomerCount) * 100) : 0}'i
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sadık Müşteriler
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loyalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Sadakat oranı: %{customerLoyaltyRate.toFixed(1)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
