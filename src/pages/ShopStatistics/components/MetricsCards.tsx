
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CalendarDays, TrendingUp, Users } from "lucide-react";

export interface MetricData {
  totalRevenue: number;
  totalAppointments: number;
  averageTicket: number;
  customerCount: number;
  completionRate: number;
}

export interface MetricsCardsProps {
  metrics: MetricData;
  isLoading: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Gelir</p>
              <h3 className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Randevu Sayısı</p>
              <h3 className="text-2xl font-bold">{metrics.totalAppointments}</h3>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-full">
              <CalendarDays className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Ortalama İşlem</p>
              <h3 className="text-2xl font-bold">{formatCurrency(metrics.averageTicket)}</h3>
            </div>
            <div className="bg-green-500/10 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Müşteri Sayısı</p>
              <h3 className="text-2xl font-bold">{metrics.customerCount}</h3>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
