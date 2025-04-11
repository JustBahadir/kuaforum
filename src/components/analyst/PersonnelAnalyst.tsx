
import { useQuery } from "@tanstack/react-query";
import { AnalystBox } from "./AnalystBox";
import { analyzePersonnelData } from "@/lib/utils/analysisUtils";
import { personelIslemleriServisi } from "@/lib/supabase";

interface PersonnelAnalystProps {
  personnelId?: number;
  dateRange?: { from: Date; to: Date };
  period?: string;
}

export function PersonnelAnalyst({ personnelId, dateRange, period = "weekly" }: PersonnelAnalystProps) {
  const { data: operations = [], isLoading: isLoadingOperations } = 
    useQuery({
      queryKey: ['personel-islemleri-analysis', personnelId, dateRange],
      queryFn: async () => {
        return await personelIslemleriServisi.hepsiniGetir();
      },
      enabled: !!personnelId,
      staleTime: 0 // Force refetch every time to ensure fresh data
    });
    
  // Filter data by personnel id
  const personnelOperations = operations.filter(op => op.personel_id === personnelId);
    
  // Filter data by date range
  const filteredOperations = dateRange 
    ? personnelOperations.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      })
    : personnelOperations;

  // Get period-specific title
  const getPeriodTitle = () => {
    switch (period) {
      case "daily": return "Günlük Analiz";
      case "weekly": return "Haftalık Analiz";
      case "monthly": return "Aylık Analiz";
      case "yearly": return "Yıllık Analiz";
      case "custom": return "Özel Tarih Analizi";
      default: return "Personel Analizi";
    }
  };

  // Analyze data
  const analysis = analyzePersonnelData(filteredOperations, period);
  
  const insights = [
    analysis.mostProfitableService,
    analysis.mostPopularService,
    analysis.busiestDays,
    analysis.revenueChange,
  ].filter(Boolean);

  return (
    <AnalystBox
      title={getPeriodTitle()}
      insights={insights}
      isLoading={isLoadingOperations}
      hasEnoughData={analysis.hasEnoughData}
    />
  );
}
