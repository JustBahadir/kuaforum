
import { useQuery } from "@tanstack/react-query";
import { AnalystBox } from "./AnalystBox";
import { analyzePersonnelData } from "@/lib/utils/analysisUtils";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";

interface PersonnelAnalystProps {
  personnelId?: number;
}

export function PersonnelAnalyst({ personnelId }: PersonnelAnalystProps) {
  const { data: operations = [], isLoading: isLoadingOperations, refetch: refetchOperations } = 
    useQuery({
      queryKey: ['personel-islemleri-analysis', personnelId],
      queryFn: async () => {
        return await personelIslemleriServisi.hepsiniGetir();
      },
      staleTime: 60000 // 1 minute
    });
    
  const { data: personnel = [], isLoading: isLoadingPersonnel, refetch: refetchPersonnel } = 
    useQuery({
      queryKey: ['personel-analysis'],
      queryFn: () => personelServisi.hepsiniGetir(),
      staleTime: 60000 // 1 minute
    });

  const handleRefresh = async () => {
    await Promise.all([refetchOperations(), refetchPersonnel()]);
  };
  
  const isLoading = isLoadingOperations || isLoadingPersonnel;

  // Filter operations if specific personnel is selected
  const filteredOperations = personnelId 
    ? operations.filter(op => op.personel_id === personnelId) 
    : operations;

  // Analyze data
  const analysis = analyzePersonnelData(filteredOperations, personnel);
  
  const insights = [
    analysis.mostOperationsStaff,
    analysis.mostRevenueStaff,
    analysis.highestRatedStaff,
    analysis.serviceSpecializations,
  ].filter(Boolean);

  return (
    <AnalystBox
      title={personnelId ? "Personel Analizi" : "Personel Performansı"}
      insights={insights}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      hasEnoughData={analysis.hasEnoughData}
    />
  );
}
