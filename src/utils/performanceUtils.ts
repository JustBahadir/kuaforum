
import { formatCurrency } from "@/lib/utils";

interface ProcessedServiceData {
  name: string;
  count: number;
  revenue: number;
  personnelId: number;
}

// Process service data
export const processServiceData = (operations: any[]) => {
  const serviceMap = new Map<string, ProcessedServiceData>();

  operations.forEach(op => {
    if (!op || !op.islem) return;
    
    const serviceName = op.islem.islem_adi || "Diğer";
    const serviceKey = `${serviceName}-${op.personel_id}`;
    
    if (!serviceMap.has(serviceKey)) {
      serviceMap.set(serviceKey, {
        name: serviceName,
        count: 0,
        revenue: 0,
        personnelId: op.personel_id
      });
    }
    
    const service = serviceMap.get(serviceKey)!;
    service.count += 1;
    service.revenue += Number(op.tutar) || 0;
  });
  
  return Array.from(serviceMap.values());
};

// Generate insights based on operations data
export const generateSmartInsights = (operations: any[], serviceData: ProcessedServiceData[]) => {
  const insights: string[] = [];
  
  if (operations.length === 0) {
    return ["Seçili tarih aralığında veri bulunmamaktadır."];
  }
  
  // Group operations by personnel
  const personnelOperations = operations.reduce((acc, op) => {
    if (!acc[op.personel_id]) {
      acc[op.personel_id] = [];
    }
    acc[op.personel_id].push(op);
    return acc;
  }, {} as Record<number, any[]>);
  
  // Calculate personnel performance metrics
  const personnelMetrics = Object.entries(personnelOperations).map(([personnelId, ops]) => {
    const total = ops.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0);
    return {
      personnelId: Number(personnelId),
      operationCount: ops.length,
      totalRevenue: total,
      averageRevenue: ops.length > 0 ? total / ops.length : 0
    };
  });
  
  // Best performer by revenue
  if (personnelMetrics.length > 0) {
    const bestRevenue = [...personnelMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
    const bestRevenuePersonnelName = operations.find(op => op.personel_id === bestRevenue.personnelId)?.personel?.ad_soyad || "Bilinmeyen";
    
    insights.push(`En yüksek ciroyu ${bestRevenuePersonnelName} elde etti (${formatCurrency(bestRevenue.totalRevenue)}).`);
  }
  
  // Best performer by operation count
  if (personnelMetrics.length > 0) {
    const mostOperations = [...personnelMetrics].sort((a, b) => b.operationCount - a.operationCount)[0];
    const mostOperationsPersonnelName = operations.find(op => op.personel_id === mostOperations.personnelId)?.personel?.ad_soyad || "Bilinmeyen";
    
    insights.push(`En çok işlemi ${mostOperationsPersonnelName} gerçekleştirdi (${mostOperations.operationCount} işlem).`);
  }
  
  // Best service
  if (serviceData.length > 0) {
    const servicesByRevenue = [...serviceData].sort((a, b) => b.revenue - a.revenue);
    if (servicesByRevenue.length > 0) {
      const topService = servicesByRevenue[0];
      insights.push(`En yüksek gelir getiren hizmet: ${topService.name} (${formatCurrency(topService.revenue)}).`);
    }
  }
  
  return insights;
};
