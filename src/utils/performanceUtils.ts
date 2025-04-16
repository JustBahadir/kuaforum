
export interface ServicePerformanceData {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

export interface CategoryPerformanceData {
  name: string;
  count: number;
  revenue: number;
  percentage?: number;
}

export function processServiceData(operations: any[]): ServicePerformanceData[] {
  if (!operations || operations.length === 0) {
    return [];
  }

  // Group by service name
  const serviceMap = new Map<string, ServicePerformanceData>();
  let totalRevenue = 0;

  operations.forEach(op => {
    if (!op) return;
    
    const serviceName = op.islem?.islem_adi || op.aciklama?.split(' hizmeti verildi')[0] || 'Bilinmeyen Hizmet';
    const revenue = Number(op.tutar) || 0;
    
    if (!serviceMap.has(serviceName)) {
      serviceMap.set(serviceName, {
        name: serviceName,
        count: 0,
        revenue: 0
      });
    }
    
    const entry = serviceMap.get(serviceName)!;
    entry.count += 1;
    entry.revenue += revenue;
    totalRevenue += revenue;
  });
  
  // Calculate percentages and prepare for visualization
  return Array.from(serviceMap.values())
    .map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function processCategoryData(operations: any[], services: any[], categories: any[]): CategoryPerformanceData[] {
  if (!operations || operations.length === 0 || !services || !categories) {
    return [];
  }

  // Group by category
  const categoryMap = new Map<string, CategoryPerformanceData>();
  let totalRevenue = 0;

  operations.forEach(op => {
    if (!op || !op.islem_id) return;
    
    const service = services.find(s => s.id === op.islem_id);
    if (!service || !service.kategori_id) return;
    
    const category = categories.find(c => c.id === service.kategori_id);
    if (!category) return;
    
    const categoryName = category.kategori_adi;
    const revenue = Number(op.tutar) || 0;
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        count: 0,
        revenue: 0
      });
    }
    
    const entry = categoryMap.get(categoryName)!;
    entry.count += 1;
    entry.revenue += revenue;
    totalRevenue += revenue;
  });
  
  // Calculate percentages and prepare for visualization
  return Array.from(categoryMap.values())
    .map(item => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function generateSmartInsights(operations: any[], serviceData: ServicePerformanceData[]): string[] {
  if (!operations || operations.length === 0 || !serviceData || serviceData.length === 0) {
    return [];
  }
  
  const insights: string[] = [];
  const totalOperations = operations.length;
  const totalRevenue = serviceData.reduce((sum, s) => sum + s.revenue, 0);
  
  // Sort services by count and revenue
  const mostFrequent = [...serviceData].sort((a, b) => b.count - a.count)[0];
  const mostRevenue = [...serviceData].sort((a, b) => b.revenue - a.revenue)[0];
  
  if (mostFrequent) {
    insights.push(`En çok yapılan işlem "${mostFrequent.name}" olarak görülüyor (${mostFrequent.count} işlem).`);
  }
  
  if (mostRevenue) {
    insights.push(`Bu işlemden toplam ${formatCurrency(mostRevenue.revenue)} gelir elde edildi.`);
  }
  
  // Find popular combinations
  if (operations.length >= 2) {
    const serviceCombinations: Record<string, number> = {};
    
    // Create a map of service IDs for quick lookup
    const serviceIds = new Map<number, string>();
    operations.forEach(op => {
      if (op.islem_id && op.islem?.islem_adi) {
        serviceIds.set(op.islem_id, op.islem.islem_adi);
      }
    });
    
    // Group operations by date to find services provided on the same day
    const opsByDate: Record<string, any[]> = {};
    operations.forEach(op => {
      if (!op.created_at) return;
      
      const dateStr = new Date(op.created_at).toISOString().split('T')[0];
      if (!opsByDate[dateStr]) {
        opsByDate[dateStr] = [];
      }
      opsByDate[dateStr].push(op);
    });
    
    // Find combinations of services on the same day
    Object.values(opsByDate).forEach(dayOps => {
      if (dayOps.length <= 1) return;
      
      for (let i = 0; i < dayOps.length; i++) {
        for (let j = i + 1; j < dayOps.length; j++) {
          const op1 = dayOps[i];
          const op2 = dayOps[j];
          
          const name1 = op1.islem?.islem_adi || op1.aciklama?.split(' hizmeti verildi')[0] || 'Bilinmeyen';
          const name2 = op2.islem?.islem_adi || op2.aciklama?.split(' hizmeti verildi')[0] || 'Bilinmeyen';
          
          if (name1 && name2 && name1 !== name2) {
            const comboKey = [name1, name2].sort().join(' + ');
            serviceCombinations[comboKey] = (serviceCombinations[comboKey] || 0) + 1;
          }
        }
      }
    });
    
    // Find most popular combination
    const combos = Object.entries(serviceCombinations)
      .sort((a, b) => b[1] - a[1]);
    
    if (combos.length > 0) {
      insights.push(`En popüler hizmet kombinasyonu: "${combos[0][0]}"`);
    }
  }
  
  insights.push(`Toplam ciro: ${formatCurrency(totalRevenue)}`);
  insights.push(`Toplam işlem sayısı: ${totalOperations}`);
  
  return insights;
}

export function generateCategoryInsights(categoryData: CategoryPerformanceData[]): string[] {
  if (!categoryData || categoryData.length === 0) {
    return [];
  }
  
  const insights: string[] = [];
  const totalOperations = categoryData.reduce((sum, c) => sum + c.count, 0);
  const totalRevenue = categoryData.reduce((sum, c) => sum + c.revenue, 0);
  
  // Sort categories by count and revenue
  const mostFrequent = [...categoryData].sort((a, b) => b.count - a.count)[0];
  const mostRevenue = [...categoryData].sort((a, b) => b.revenue - a.revenue)[0];
  const leastFrequent = [...categoryData].sort((a, b) => a.count - b.count)[0];
  
  if (mostFrequent) {
    insights.push(`En çok işlem yapılan kategori "${mostFrequent.name}" olarak görülüyor (${mostFrequent.count} işlem).`);
  }
  
  if (mostRevenue && mostRevenue.name !== mostFrequent.name) {
    insights.push(`En yüksek ciro "${mostRevenue.name}" kategorisinden elde edildi (${formatCurrency(mostRevenue.revenue)}).`);
  }
  
  if (leastFrequent && categoryData.length > 1) {
    insights.push(`En az tercih edilen kategori "${leastFrequent.name}" olarak görülüyor (${leastFrequent.count} işlem).`);
  }
  
  // Calculate average revenue per category
  const avgRevenuePerCategory = totalRevenue / categoryData.length;
  insights.push(`Kategori başına ortalama ciro: ${formatCurrency(avgRevenuePerCategory)}`);
  
  return insights;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
