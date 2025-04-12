
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { AnalystBox } from "@/components/analyst/AnalystBox";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface StatisticsCommentaryProps {
  data: any;
  isLoading: boolean;
}

export function StatisticsCommentary({ data, isLoading }: StatisticsCommentaryProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [data, isLoading]);

  const generateInsights = () => {
    setIsGenerating(true);

    try {
      if (isLoading || !data.operations || data.operations.length === 0) {
        setInsights([]);
        setIsGenerating(false);
        return;
      }

      const operations = data.operations;
      const personnel = data.personnel;
      const services = data.services;
      const categories = data.categories;
      const dateRange = data.dateRange;
      
      const insights = [];
      
      // Top service by revenue
      const serviceMap = new Map();
      operations.forEach((op: any) => {
        const serviceId = op.islem_id;
        const service = services.find((s: any) => s.id === serviceId);
        const serviceName = service?.islem_adi || op.aciklama || "Diğer";
        
        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, { revenue: 0, count: 0 });
        }
        
        const entry = serviceMap.get(serviceName);
        entry.revenue += op.tutar || 0;
        entry.count += 1;
      });
      
      const serviceArray = Array.from(serviceMap.entries())
        .map(([name, data]: [string, any]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue);
      
      if (serviceArray.length > 0) {
        insights.push(`En çok kazandıran hizmet: ${serviceArray[0].name} (${formatCurrency(serviceArray[0].revenue)})`);
      }
      
      // Most popular service
      const servicesByCount = [...serviceArray].sort((a, b) => b.count - a.count);
      if (servicesByCount.length > 0 && servicesByCount[0].name !== serviceArray[0].name) {
        insights.push(`En çok tercih edilen hizmet: ${servicesByCount[0].name} (${servicesByCount[0].count} işlem)`);
      }
      
      // Best performing personnel
      const personnelMap = new Map();
      operations.forEach((op: any) => {
        if (!op.personel_id) return;
        
        const personObj = personnel.find((p: any) => p.id === op.personel_id);
        if (!personObj) return;
        
        const personName = personObj.ad_soyad;
        
        if (!personnelMap.has(personName)) {
          personnelMap.set(personName, { revenue: 0, count: 0 });
        }
        
        const entry = personnelMap.get(personName);
        entry.revenue += op.tutar || 0;
        entry.count += 1;
      });
      
      const personnelArray = Array.from(personnelMap.entries())
        .map(([name, data]: [string, any]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue);
      
      if (personnelArray.length > 0) {
        insights.push(`En yüksek ciro yapan personel: ${personnelArray[0].name} (${formatCurrency(personnelArray[0].revenue)})`);
      }
      
      const personnelByCount = [...personnelArray].sort((a, b) => b.count - a.count);
      if (personnelByCount.length > 0 && personnelByCount[0].name !== personnelArray[0].name) {
        insights.push(`En çok işlem yapan personel: ${personnelByCount[0].name} (${personnelByCount[0].count} işlem)`);
      }
      
      // Daily performance
      const dailyMap = new Map();
      operations.forEach((op: any) => {
        if (!op.created_at) return;
        
        const date = new Date(op.created_at);
        const dayName = format(date, 'EEEE', { locale: tr });
        
        if (!dailyMap.has(dayName)) {
          dailyMap.set(dayName, { revenue: 0, count: 0 });
        }
        
        const entry = dailyMap.get(dayName);
        entry.revenue += op.tutar || 0;
        entry.count += 1;
      });
      
      const dailyArray = Array.from(dailyMap.entries())
        .map(([name, data]: [string, any]) => ({ name, ...data }));
      
      const bestRevenueDay = dailyArray.sort((a, b) => b.revenue - a.revenue)[0];
      if (bestRevenueDay) {
        insights.push(`En yüksek ciro günü: ${bestRevenueDay.name} (${formatCurrency(bestRevenueDay.revenue)})`);
      }
      
      const busiestDay = dailyArray.sort((a, b) => b.count - a.count)[0];
      if (busiestDay && busiestDay.name !== bestRevenueDay?.name) {
        insights.push(`En yoğun gün: ${busiestDay.name} (${busiestDay.count} işlem)`);
      }
      
      // Date range info
      const rangeStart = dateRange.from.toLocaleDateString();
      const rangeEnd = dateRange.to.toLocaleDateString();
      const totalRevenue = operations.reduce((sum: number, op: any) => sum + (op.tutar || 0), 0);
      
      insights.push(`${rangeStart} - ${rangeEnd} arasında toplam ${formatCurrency(totalRevenue)} ciro elde edildi.`);
      
      // Average ticket size
      const avgTicket = totalRevenue / operations.length;
      insights.push(`Ortalama işlem tutarı: ${formatCurrency(avgTicket)}`);
      
      // Randomize and pick a subset
      const shuffled = [...insights].sort(() => 0.5 - Math.random());
      setInsights(shuffled.slice(0, 4));
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights(["Veri analizi sırasında bir hata oluştu."]);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasEnoughData = !isLoading && data.operations && data.operations.length > 0;

  return (
    <div className="mb-6">
      <AnalystBox
        title=""
        insights={insights}
        isLoading={isGenerating || isLoading}
        onRefresh={generateInsights}
        hasEnoughData={hasEnoughData}
      />
    </div>
  );
}
