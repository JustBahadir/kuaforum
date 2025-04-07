
import { useQuery } from "@tanstack/react-query";
import { AnalystBox } from "./AnalystBox";
import { analyzeShopData } from "@/lib/utils/analysisUtils";
import { personelIslemleriServisi, randevuServisi } from "@/lib/supabase";

interface ShopAnalystProps {
  dukkanId?: number;
}

export function ShopAnalyst({ dukkanId }: ShopAnalystProps) {
  const { data: operations = [], isLoading: isLoadingOperations, refetch: refetchOperations } = 
    useQuery({
      queryKey: ['personel-islemleri-analysis'],
      queryFn: async () => {
        return await personelIslemleriServisi.hepsiniGetir();
      },
      enabled: !!dukkanId,
      staleTime: 60000 // 1 minute
    });
    
  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = 
    useQuery({
      queryKey: ['randevular-analysis'],
      queryFn: async () => {
        if (dukkanId) {
          return await randevuServisi.dukkanRandevulariniGetir(dukkanId);
        }
        return [];
      },
      enabled: !!dukkanId,
      staleTime: 60000 // 1 minute
    });

  const handleRefresh = async () => {
    await Promise.all([refetchOperations(), refetchAppointments()]);
  };
  
  const isLoading = isLoadingOperations || isLoadingAppointments;

  // Analyze data
  const analysis = analyzeShopData(operations, appointments);
  
  const insights = [
    analysis.mostProfitableService,
    analysis.mostPopularService,
    analysis.busiestDays,
    analysis.averageSpendingChange,
    analysis.customerRatio,
  ].filter(Boolean);

  return (
    <AnalystBox
      title="Bu Ayın Özeti"
      insights={insights}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      hasEnoughData={analysis.hasEnoughData}
    />
  );
}
