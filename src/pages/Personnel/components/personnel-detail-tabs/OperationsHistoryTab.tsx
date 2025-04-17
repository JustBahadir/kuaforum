
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DateControlBar } from "@/components/ui/date-control-bar";
import { personelIslemleriServisi } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { formatTurkishDate } from "@/utils/dateUtils";
import { toast } from "sonner";

interface OperationsHistoryTabProps {
  personnel: any;
}

export function OperationsHistoryTab({ personnel }: OperationsHistoryTabProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const { data: operationsData = [], isLoading } = useQuery({
    queryKey: ['personnel-operations', personnel?.id, dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        const operations = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
        
        return operations.filter(op => {
          if (!op.created_at) return false;
          const date = new Date(op.created_at);
          return date >= dateRange.from && date <= dateRange.to;
        });
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
        return [];
      }
    },
    enabled: !!personnel?.id,
  });

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  const handleSingleDateChange = (date: Date) => {
    setDateRange({
      from: date,
      to: date
    });
  };

  const handleMonthCycleChange = (day: number, cycleDate: Date) => {
    const currentDate = new Date();
    let fromDate = new Date();
    
    // Set to previous month's cycle day
    fromDate.setDate(day);
    if (currentDate.getDate() < day) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    // Create the end date (same day, current month)
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    
    setDateRange({
      from: fromDate,
      to: toDate
    });
  };

  // Calculate summary statistics
  const totalRevenue = operationsData.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = operationsData.reduce((sum, op) => sum + (op.odenen || 0), 0);
  const totalOperations = operationsData.length;
  const averageRevenue = totalOperations > 0 ? totalRevenue / totalOperations : 0;

  const aiInsights = () => {
    if (!operationsData.length) return [];
    
    const insights = [];
    
    insights.push(`${personnel.ad_soyad}, seçilen dönemde toplam ${totalOperations} işlem gerçekleştirdi.`);
    
    if (totalRevenue > 0) {
      insights.push(`Bu işlemlerden toplam ${formatCurrency(totalRevenue)} ciro elde edildi.`);
    }
    
    if (totalCommission > 0) {
      insights.push(`Personele toplam ${formatCurrency(totalCommission)} prim/ödeme yapıldı.`);
    }
    
    const serviceCounts: Record<string, { count: number, revenue: number }> = {};
    operationsData.forEach(op => {
      const serviceName = op.islem?.islem_adi || op.aciklama || 'Diğer';
      if (!serviceCounts[serviceName]) {
        serviceCounts[serviceName] = { count: 0, revenue: 0 };
      }
      serviceCounts[serviceName].count += 1;
      serviceCounts[serviceName].revenue += op.tutar || 0;
    });
    
    const mostFrequentService = Object.entries(serviceCounts)
      .sort((a, b) => b[1].count - a[1].count)[0];
    
    if (mostFrequentService) {
      insights.push(`En çok yaptığı işlem: ${mostFrequentService[1].count} kez ile ${mostFrequentService[0]}.`);
    }
    
    const mostProfitableService = Object.entries(serviceCounts)
      .sort((a, b) => b[1].revenue - a[1].revenue)[0];
    
    if (mostProfitableService && mostProfitableService[1].revenue > 0) {
      insights.push(`En çok kazandıran işlem: ${formatCurrency(mostProfitableService[1].revenue)} ile ${mostProfitableService[0]}.`);
    }
    
    return insights;
  };

  const insights = aiInsights();

  const handleRecover = async () => {
    try {
      const response = await personelIslemleriServisi.recoverOperationsFromAppointments(personnel.id);
      toast.success(`${response.count} işlem kurtarıldı ve personele atandı`);
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlemler kurtarılırken bir hata oluştu");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <DateControlBar
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onSingleDateChange={handleSingleDateChange}
          onMonthCycleChange={handleMonthCycleChange}
        />
        
        <Button variant="outline" size="sm" onClick={handleRecover}>
          Eksik İşlemleri Kurtarın
        </Button>
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6">
          {!isLoading && insights.length > 0 ? (
            <div className="bg-muted/30 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-2">Akıllı Analiz</h3>
              <ul className="space-y-1">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">İşlem Sayısı</div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div className="text-2xl font-semibold">{totalOperations}</div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Toplam Ciro</div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div className="text-2xl font-semibold text-green-600">
                  {formatCurrency(totalRevenue)}
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Toplam Ödenen</div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div className="text-2xl font-semibold text-blue-600">
                  {formatCurrency(totalCommission)}
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Ortalama İşlem</div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div className="text-2xl font-semibold">
                  {formatCurrency(averageRevenue)}
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : operationsData.length === 0 ? (
            <Alert>
              <CircleAlert className="h-4 w-4" />
              <AlertDescription>
                Seçilen tarih aralığında bu personel için işlem kaydı bulunamadı.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2">Tarih</th>
                    <th className="text-left p-2">İşlem</th>
                    <th className="text-left p-2">Müşteri</th>
                    <th className="text-right p-2">Tutar</th>
                    <th className="text-right p-2">Prim %</th>
                    <th className="text-right p-2">Ödenen</th>
                  </tr>
                </thead>
                <tbody>
                  {operationsData.map((op, index) => (
                    <tr key={index} className="border-t hover:bg-muted/30">
                      <td className="p-2 whitespace-nowrap">
                        {op.created_at ? formatTurkishDate(new Date(op.created_at)) : "-"}
                      </td>
                      <td className="p-2">{op.islem?.islem_adi || op.aciklama || "-"}</td>
                      <td className="p-2">
                        {op.musteri ? `${op.musteri.first_name} ${op.musteri.last_name || ""}` : "-"}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(op.tutar)}
                      </td>
                      <td className="p-2 text-right">
                        %{op.prim_yuzdesi || 0}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(op.odenen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
