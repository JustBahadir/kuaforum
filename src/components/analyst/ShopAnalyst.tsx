
import { useQuery } from "@tanstack/react-query";
import { AnalystBox } from "./AnalystBox";
import { analyzeShopData } from "@/lib/utils/analysisUtils";
import { personelIslemleriServisi, randevuServisi } from "@/lib/supabase";

interface ShopAnalystProps {
  dukkanId?: number;
  dateRange?: { from: Date; to: Date };
  period?: string;
}

export function ShopAnalyst({ dukkanId, dateRange, period = "daily" }: ShopAnalystProps) {
  const { data: operations = [], isLoading: isLoadingOperations, refetch: refetchOperations } = 
    useQuery({
      queryKey: ['personel-islemleri-analysis', dateRange],
      queryFn: async () => {
        return await personelIslemleriServisi.hepsiniGetir();
      },
      enabled: !!dukkanId,
      staleTime: 0 // Force refetch every time to ensure fresh data
    });
    
  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = 
    useQuery({
      queryKey: ['randevular-analysis', dateRange],
      queryFn: async () => {
        if (dukkanId) {
          return await randevuServisi.dukkanRandevulariniGetir(dukkanId);
        }
        return [];
      },
      enabled: !!dukkanId,
      staleTime: 0 // Force refetch every time to ensure fresh data
    });

  const handleRefresh = async () => {
    await Promise.all([refetchOperations(), refetchAppointments()]);
  };
  
  const isLoading = isLoadingOperations || isLoadingAppointments;

  // Filter data by date range
  const filteredOperations = dateRange 
    ? operations.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      })
    : operations;
  
  const filteredAppointments = dateRange 
    ? appointments.filter(app => {
        if (!app.tarih) return false;
        const date = new Date(app.tarih);
        return date >= dateRange.from && date <= dateRange.to;
      })
    : appointments;

  // Get period-specific title
  const getPeriodTitle = () => {
    switch (period) {
      case "daily": return "Günlük Analiz";
      case "weekly": return "Haftalık Analiz";
      case "monthly": return "Aylık Analiz";
      case "yearly": return "Yıllık Analiz";
      case "custom": return "Özel Tarih Analizi";
      default: return "Dükkan Analizi";
    }
  };

  // Analyze data
  const analysis = analyzeShopData(filteredOperations, filteredAppointments, period);
  
  const insights = [
    analysis.mostProfitableService,
    analysis.mostPopularService,
    analysis.busiestDays,
    analysis.averageSpendingChange,
    analysis.customerRatio,
    analysis.peakHours,
    analysis.revenueChange,
    analysis.cancellationRate,
  ].filter(Boolean);

  // Always ensure we have at least 4 insights to display
  const displayInsights = insights.length >= 4 ? insights.slice(0, 4) : insights;

  return (
    <AnalystBox
      title={getPeriodTitle()}
      insights={displayInsights}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      hasEnoughData={analysis.hasEnoughData}
    />
  );
}
