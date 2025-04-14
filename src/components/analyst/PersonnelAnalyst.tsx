
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalystBox } from "@/components/analyst/AnalystBox";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

export function PersonnelAnalyst() {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(true);

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel-analyst'],
    queryFn: personelServisi.hepsiniGetir,
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['personel-operations-analyst'],
    queryFn: personelIslemleriServisi.hepsiniGetir,
  });

  useEffect(() => {
    const analyzeData = () => {
      setIsLoading(true);
      
      try {
        // Check if we have enough data
        if (personeller.length === 0 || islemler.length < 3) {
          setHasEnoughData(false);
          setInsights([]);
          return;
        }
        
        setHasEnoughData(true);
        
        // Calculate key metrics
        const personnelMetrics = personeller.map(p => {
          const personnelOps = islemler.filter(op => op.personel_id === p.id);
          const totalOps = personnelOps.length;
          const totalRevenue = personnelOps.reduce((sum, op) => sum + (op.tutar || 0), 0);
          const avgRevenue = totalOps > 0 ? totalRevenue / totalOps : 0;
          
          return {
            id: p.id,
            name: p.ad_soyad,
            totalOps,
            totalRevenue,
            avgRevenue
          };
        }).filter(p => p.totalOps > 0);
        
        // Sort by various metrics for analysis
        const sortedByOps = [...personnelMetrics].sort((a, b) => b.totalOps - a.totalOps);
        const sortedByRevenue = [...personnelMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue);
        const totalOperations = islemler.length;
        
        // Generate insights
        const newInsights: string[] = [];
        
        if (sortedByOps.length > 0) {
          newInsights.push(`Bu dönemde en çok işlem yapan kişi: ${sortedByOps[0].name} (${sortedByOps[0].totalOps} işlem)`);
        }
        
        if (sortedByRevenue.length > 0) {
          newInsights.push(`Toplamda en fazla ciroyu elde eden kişi: ${sortedByRevenue[0].name} (${formatCurrency(sortedByRevenue[0].totalRevenue)})`);
        }
        
        // Calculate average metrics for comparison
        const avgTotalRevenue = personnelMetrics.reduce((sum, p) => sum + p.totalRevenue, 0) / personnelMetrics.length;
        
        // Find interesting outliers and patterns
        personnelMetrics.forEach(p => {
          const revenueDiffPercent = Math.round((p.totalRevenue - avgTotalRevenue) / avgTotalRevenue * 100);
          if (Math.abs(revenueDiffPercent) >= 10) {
            newInsights.push(`${p.name} ortalamadan %${Math.abs(revenueDiffPercent)} ${revenueDiffPercent > 0 ? 'daha fazla' : 'daha az'} ciro yaptı`);
          }
        });
        
        // Add operation distribution insight
        if (sortedByOps.length > 0 && totalOperations > 0) {
          const topPerformer = sortedByOps[0];
          const opPercentage = Math.round((topPerformer.totalOps / totalOperations) * 100);
          if (opPercentage > 20) {
            newInsights.push(`Toplam işlemlerin %${opPercentage}'ı ${topPerformer.name} tarafından gerçekleştirildi`);
          }
        }
        
        setInsights(newInsights);
      } catch (error) {
        console.error("Personnel analysis error:", error);
        setHasEnoughData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    analyzeData();
  }, [personeller, islemler]);

  const handleRefresh = () => {
    setIsLoading(true);
    setInsights([]);
    
    // Short timeout to simulate refresh
    setTimeout(() => {
      const { data: currentPersonnel = [], refetch: refetchPersonnel } = useQuery({
        queryKey: ['personel-analyst'],
        queryFn: personelServisi.hepsiniGetir,
      });
      
      const { data: currentOps = [], refetch: refetchOps } = useQuery({
        queryKey: ['personel-operations-analyst'],
        queryFn: personelIslemleriServisi.hepsiniGetir,
      });
      
      Promise.all([refetchPersonnel(), refetchOps()]).finally(() => {
        setIsLoading(false);
      });
    }, 500);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Akıllı Analiz</CardTitle>
      </CardHeader>
      <CardContent>
        <AnalystBox
          title=""
          insights={insights}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          hasEnoughData={hasEnoughData}
        />
      </CardContent>
    </Card>
  );
}
