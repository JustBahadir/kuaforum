
import { useQuery, useMutation } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi, islemServisi } from "@/lib/supabase";
import { AnalystBox } from "./AnalystBox";
import { useState, useEffect } from "react";

interface AnalysisResult {
  topPerformer?: string;
  mostOperationsPersonnel?: string;
  topPointEarner?: string;
  operationsGrowth?: string;
  averageOperations?: string;
  operationTypeDistribution?: string;
  topService?: string;
  hasEnoughData: boolean;
}

export function PersonnelAnalyst() {
  const [insights, setInsights] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data
  const { data: personeller = [], isLoading: personelLoading } = useQuery({
    queryKey: ['personel-list-analyst'],
    queryFn: personelServisi.hepsiniGetir
  });
  
  const { data: operasyonlar = [], isLoading: operasyonLoading } = useQuery({
    queryKey: ['personel-islemleri-analyst'],
    queryFn: personelIslemleriServisi.hepsiniGetir
  });
  
  const { data: islemler = [], isLoading: islemLoading } = useQuery({
    queryKey: ['islemler-analyst'],
    queryFn: islemServisi.hepsiniGetir
  });
  
  // Generate insights from data
  useEffect(() => {
    if (!personelLoading && !operasyonLoading && !islemLoading) {
      generateInsights();
    }
  }, [personeller, operasyonlar, islemler, personelLoading, operasyonLoading, islemLoading]);
  
  // Function to analyze data and generate insights
  const generateInsights = () => {
    // Only analyze active personnel
    const activePersonnel = personeller.filter(p => p.aktif !== false);
    if (activePersonnel.length === 0 || operasyonlar.length === 0) {
      setInsights([
        "Henüz yeterli veri bulunamadı. Veri oluştuğunda analizler görüntülenecektir."
      ]);
      return;
    }

    // Group operations by personnel
    const operationsByPersonnel = operasyonlar.reduce((acc: Record<string, any>, op) => {
      const personelId = op.personel_id?.toString();
      if (!personelId) return acc;
      
      if (!acc[personelId]) {
        acc[personelId] = {
          operations: 0,
          revenue: 0,
          commission: 0,
          points: 0,
          services: {}
        };
      }
      
      acc[personelId].operations += 1;
      acc[personelId].revenue += op.tutar || 0;
      acc[personelId].commission += op.odenen || 0;
      acc[personelId].points += op.puan || 0;
      
      // Track services performed
      const serviceId = op.islem_id?.toString();
      if (serviceId) {
        if (!acc[personelId].services[serviceId]) {
          acc[personelId].services[serviceId] = 0;
        }
        acc[personelId].services[serviceId] += 1;
      }
      
      return acc;
    }, {});
    
    // Add personnel details to analysis
    const analysisData = activePersonnel.map(person => {
      const data = operationsByPersonnel[person.id?.toString()] || {
        operations: 0,
        revenue: 0,
        commission: 0,
        points: 0,
        services: {}
      };
      
      return {
        id: person.id,
        name: person.ad_soyad,
        workingSystem: person.calisma_sistemi || 'aylik_maas',
        ...data
      };
    });
    
    // Sort by different metrics
    const byOperations = [...analysisData].sort((a, b) => b.operations - a.operations);
    const byRevenue = [...analysisData].sort((a, b) => b.revenue - a.revenue);
    const byPoints = [...analysisData].sort((a, b) => b.points - a.points);
    
    // Group operations by date to analyze trends
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const operationsByDate = operasyonlar.reduce((acc: Record<string, any>, op) => {
      if (!op.created_at) return acc;
      
      const date = new Date(op.created_at);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          count: 0,
          revenue: 0,
          date: date
        };
      }
      
      acc[dateStr].count += 1;
      acc[dateStr].revenue += op.tutar || 0;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const dateDataArray = Object.values(operationsByDate)
      .sort((a: any, b: any) => a.date - b.date);
    
    // Split into recent and previous periods
    const midpoint = Math.floor(dateDataArray.length / 2);
    const recentPeriod = dateDataArray.slice(midpoint);
    const previousPeriod = dateDataArray.slice(0, midpoint);
    
    // Calculate operations growth
    const recentOperations = recentPeriod.reduce((sum: number, day: any) => sum + day.count, 0);
    const previousOperations = previousPeriod.reduce((sum: number, day: any) => sum + day.count, 0);
    let operationsGrowth = 0;
    if (previousOperations > 0) {
      operationsGrowth = ((recentOperations - previousOperations) / previousOperations) * 100;
    }
    
    // Generate insights
    const possibleInsights: string[] = [];
    
    // Top performer by points
    if (byPoints.length > 0 && byPoints[0].points > 0) {
      possibleInsights.push(
        `${byPoints[0].name}, toplam ${byPoints[0].points} puanla en yüksek puana sahip personel oldu.`
      );
    }
    
    // Most operations
    if (byOperations.length > 0 && byOperations[0].operations > 0) {
      possibleInsights.push(
        `${byOperations[0].name}, ${byOperations[0].operations} işlemle en çok hizmet veren personel oldu.`
      );
    }
    
    // Operations growth
    if (operationsGrowth !== 0) {
      const growthText = operationsGrowth > 0 
        ? `İşlem sayısında geçen döneme göre %${Math.abs(operationsGrowth).toFixed(0)} artış görüldü.`
        : `İşlem sayısında geçen döneme göre %${Math.abs(operationsGrowth).toFixed(0)} azalma görüldü.`;
      
      possibleInsights.push(growthText);
    }
    
    // Average operations per personnel
    const totalOperations = operasyonlar.length;
    const operationsAvg = totalOperations / activePersonnel.length;
    
    if (!isNaN(operationsAvg) && operationsAvg > 0) {
      possibleInsights.push(
        `Personel başına ortalama ${Math.round(operationsAvg)} işlem gerçekleştirildi.`
      );
    }
    
    // Most popular service
    const serviceCount: Record<string, { count: number; name: string }> = {};
    operasyonlar.forEach(op => {
      const serviceId = op.islem_id?.toString();
      if (!serviceId) return;
      
      const service = islemler.find(s => s.id === op.islem_id);
      if (!service) return;
      
      if (!serviceCount[serviceId]) {
        serviceCount[serviceId] = { count: 0, name: service.islem_adi || "Bilinmeyen İşlem" };
      }
      
      serviceCount[serviceId].count += 1;
    });
    
    const servicesSorted = Object.values(serviceCount).sort((a, b) => b.count - a.count);
    
    if (servicesSorted.length > 0) {
      possibleInsights.push(
        `En çok tercih edilen hizmet "${servicesSorted[0].name}" oldu (${servicesSorted[0].count} işlem).`
      );
    }
    
    // Personnel with highest commission (only for commission-based)
    const commissionBasedPersonnel = analysisData.filter(p => p.workingSystem === 'prim_komisyon');
    if (commissionBasedPersonnel.length > 0) {
      const topCommission = commissionBasedPersonnel.sort((a, b) => b.commission - a.commission)[0];
      if (topCommission.commission > 0) {
        const amount = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(topCommission.commission);
        possibleInsights.push(
          `${topCommission.name}, ${amount} primle en yüksek komisyon geliri elde eden personel oldu.`
        );
      }
    }
    
    // For each working system, find the top performer
    const workingSystemGroups: Record<string, any[]> = {
      'aylik_maas': [],
      'prim_komisyon': [],
      'gunluk_yevmiye': [],
      'haftalik_yevmiye': []
    };
    
    analysisData.forEach(person => {
      if (workingSystemGroups[person.workingSystem]) {
        workingSystemGroups[person.workingSystem].push(person);
      }
    });
    
    // Add top performer for each working type
    Object.entries(workingSystemGroups).forEach(([system, people]) => {
      if (people.length > 1) { // Only if we have multiple people in this group
        const sortedByPoints = [...people].sort((a, b) => b.points - a.points);
        if (sortedByPoints[0].points > 0) {
          let systemName = "";
          switch (system) {
            case 'aylik_maas':
              systemName = "aylık maaşlı";
              break;
            case 'prim_komisyon':
              systemName = "primli";
              break;
            case 'gunluk_yevmiye':
              systemName = "günlük yevmiyeli";
              break;
            case 'haftalik_yevmiye':
              systemName = "haftalık yevmiyeli";
              break;
          }
          
          possibleInsights.push(
            `${sortedByPoints[0].name}, ${sortedByPoints[0].points} puanla en başarılı ${systemName} personel oldu.`
          );
        }
      }
    });
    
    // Distribution of services for top personnel
    if (byOperations.length > 0 && byOperations[0].operations > 5) {
      const topPersonServiceIds = Object.keys(byOperations[0].services);
      const topPersonServices = topPersonServiceIds.map(id => {
        const service = islemler.find(s => s.id.toString() === id);
        return {
          name: service?.islem_adi || "Bilinmeyen İşlem",
          count: byOperations[0].services[id]
        };
      }).sort((a, b) => b.count - a.count);
      
      if (topPersonServices.length >= 2) {
        possibleInsights.push(
          `${byOperations[0].name}, en çok "${topPersonServices[0].name}" (${topPersonServices[0].count} kez) ve "${topPersonServices[1].name}" (${topPersonServices[1].count} kez) hizmetlerini gerçekleştirdi.`
        );
      }
    }
    
    // Randomly select insights
    const shuffled = possibleInsights.sort(() => 0.5 - Math.random());
    setInsights(shuffled.slice(0, Math.min(4, shuffled.length)));
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      generateInsights();
    } catch (error) {
      console.error("Analiz yenilenirken hata:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AnalystBox
      title="Personel Performans Analizi"
      insights={insights.length > 0 ? insights : ["Henüz yeterli veri bulunamadı. Veri oluştuğunda analizler görüntülenecektir."]}
      onRefresh={handleRefresh}
      isLoading={personelLoading || operasyonLoading || islemLoading || isRefreshing}
      hasEnoughData={insights.length > 0}
    />
  );
}
