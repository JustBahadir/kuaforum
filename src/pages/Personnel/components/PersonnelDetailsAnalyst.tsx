
import { useQuery } from "@tanstack/react-query";
import { AnalystBox } from "@/components/analyst/AnalystBox";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

interface PersonnelDetailsAnalystProps {
  personnelId: number;
}

export function PersonnelDetailsAnalyst({ personnelId }: PersonnelDetailsAnalystProps) {
  // Get personnel operations
  const { data: operations = [], isLoading: isLoadingOperations, refetch: refetchOperations } = 
    useQuery({
      queryKey: ['personnel-details-operations', personnelId],
      queryFn: async () => {
        return await personelIslemleriServisi.personelIslemleriGetir(personnelId);
      },
      enabled: !!personnelId,
      staleTime: 30000
    });
    
  // Get personnel details
  const { data: personnel, isLoading: isLoadingPersonnel, refetch: refetchPersonnel } = 
    useQuery({
      queryKey: ['personnel-details', personnelId],
      queryFn: async () => {
        return await personelServisi.getirById(personnelId);
      },
      enabled: !!personnelId,
      staleTime: 30000
    });

  const handleRefresh = async () => {
    await Promise.all([refetchOperations(), refetchPersonnel()]);
  };
  
  const isLoading = isLoadingOperations || isLoadingPersonnel;
  const hasEnoughData = operations.length >= 5;

  // Generate insights based on personnel operations
  const generateInsights = () => {
    if (!personnel || operations.length === 0) {
      return [];
    }

    // Total revenue from operations
    const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
    
    // Total count of operations
    const operationCount = operations.length;
    
    // Calculate average rating
    const ratingsCount = operations.filter(op => op.puan).length;
    const averageRating = ratingsCount > 0
      ? operations.reduce((sum, op) => sum + (op.puan || 0), 0) / ratingsCount
      : 0;
    
    // Service distribution
    const serviceDistribution: Record<string, { count: number, revenue: number }> = {};
    operations.forEach(op => {
      const serviceName = op.islem?.islem_adi || op.aciklama || "Bilinmeyen Hizmet";
      if (!serviceDistribution[serviceName]) {
        serviceDistribution[serviceName] = { count: 0, revenue: 0 };
      }
      serviceDistribution[serviceName].count += 1;
      serviceDistribution[serviceName].revenue += op.tutar || 0;
    });
    
    // Find most performed service
    const sortedServices = Object.entries(serviceDistribution)
      .sort(([, a], [, b]) => b.count - a.count);
    
    const topService = sortedServices.length > 0
      ? {
          name: sortedServices[0][0],
          count: sortedServices[0][1].count,
          percentage: Math.round((sortedServices[0][1].count / operationCount) * 100)
        }
      : null;

    // Generate insights
    const insights = [];
    
    insights.push(`${personnel.ad_soyad} son 30 günde ${operationCount} işlem gerçekleştirdi.`);
    insights.push(`Toplam ${formatCurrency(totalRevenue)} gelir elde edildi.`);
    
    if (averageRating > 0) {
      insights.push(`Müşteri memnuniyet puanı: ${averageRating.toFixed(1)}/5.`);
    }
    
    if (topService) {
      insights.push(`İşlemlerinin %${topService.percentage}'i ${topService.name} hizmetinde yoğunlaşıyor.`);
    }
    
    return insights;
  };
  
  const insights = generateInsights();

  return (
    <AnalystBox
      title="Personel Performans Analizi"
      insights={insights}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      hasEnoughData={hasEnoughData}
    />
  );
}
