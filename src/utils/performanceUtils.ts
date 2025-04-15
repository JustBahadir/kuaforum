
import { formatCurrency } from "@/lib/utils";
import { PersonelIslemi } from "@/lib/supabase/types";

export interface ServicePerformanceData {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

export const processServiceData = (operations: PersonelIslemi[] = []): ServicePerformanceData[] => {
  if (!operations || operations.length === 0) {
    return [];
  }

  const serviceMap = new Map<string, ServicePerformanceData>();
  let totalRevenue = 0;
  
  operations.forEach(op => {
    if (!op) return;
    
    const serviceName = op.islem?.islem_adi || op.aciklama || "Diğer";
    const amount = Number(op.tutar) || 0;
    
    if (!serviceMap.has(serviceName)) {
      serviceMap.set(serviceName, { name: serviceName, count: 0, revenue: 0 });
    }
    
    const entry = serviceMap.get(serviceName)!;
    entry.count += 1;
    entry.revenue += amount;
    totalRevenue += amount;
  });
  
  return Array.from(serviceMap.values())
    .map(service => ({
      ...service,
      percentage: totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

export const generateSmartInsights = (operations: PersonelIslemi[] = [], serviceData: ServicePerformanceData[] = []) => {
  if (!operations || !serviceData || operations.length === 0) {
    return ["Henüz yeterli veri bulunmamaktadır."];
  }
  
  const totalRevenue = operations.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0);
  const insights = [];
  
  const topService = serviceData[0];
  if (topService) {
    insights.push(`En çok yapılan işlem "${topService.name}" olarak görülüyor (${topService.count} işlem).`);
    insights.push(`Bu işlemden toplam ${formatCurrency(topService.revenue)} gelir elde edildi.`);
  }

  if (serviceData.length >= 2) {
    insights.push(`En popüler hizmet kombinasyonu: "${serviceData[0].name} + ${serviceData[1].name}"`);
  }

  insights.push(`Toplam ciro: ${formatCurrency(totalRevenue)}`);
  insights.push(`Toplam işlem sayısı: ${operations.length}`);

  return insights;
};
