
type AnalysisData = {
  mostProfitableService?: string;
  mostPopularService?: string;
  busiestDays?: string;
  averageSpendingChange?: string;
  customerRatio?: string;
  peakHours?: string;
  revenueChange?: string;
  cancellationRate?: string;
  mostProfitableCategory?: string;
  leastProfitableService?: string;
  averageProfitMargin?: string;
  hasEnoughData: boolean;
};

interface ServiceStat {
  name: string;
  count: number;
  revenue: number;
  cost?: number;
  profit?: number;
  profitMargin?: number;
}

export function analyzeShopData(operations = [], appointments = [], period = 'daily') {
  // Check if we have enough data to perform analysis
  const hasEnoughData = operations.length > 5 || appointments.length > 5;
  
  if (!hasEnoughData) {
    return {
      hasEnoughData: false
    };
  }
  
  // Calculate service performance
  const serviceStats = calculateServiceStatistics(operations);
  
  // Calculate customer statistics
  const customerStats = calculateCustomerStatistics(operations, appointments);
  
  // Calculate time-based statistics
  const timeStats = calculateTimeStatistics(operations, appointments, period);
  
  // Calculate revenue statistics
  const revenueStats = calculateRevenueStatistics(operations, period);
  
  // Calculate profit statistics
  const profitStats = calculateProfitStatistics(operations);
  
  return {
    // Most profitable service
    mostProfitableService: profitStats.mostProfitable ? 
      `"${profitStats.mostProfitable.name}" en yüksek kârı sağlıyor (${profitStats.mostProfitable.profit.toLocaleString()} TL, %${profitStats.mostProfitable.profitMargin.toFixed(1)} kârlılık)` : undefined,
    
    // Most popular service
    mostPopularService: serviceStats.mostPopular ? 
      `En çok tercih edilen hizmet "${serviceStats.mostPopular.name}" (${serviceStats.mostPopular.count} işlem)` : undefined,
    
    // Busiest days
    busiestDays: timeStats.busiest ? 
      `En yoğun ${period === 'daily' ? 'saatler' : period === 'weekly' ? 'günler' : 'haftalar'}: ${timeStats.busiest}` : undefined,
    
    // Average spending change
    averageSpendingChange: revenueStats.averageSpendingChange ? 
      `Müşteri başı ortalama harcama: ${revenueStats.averageSpendingChange}` : undefined,
    
    // Customer ratio
    customerRatio: customerStats.newVsReturningRatio ? 
      `${customerStats.newVsReturningRatio}` : undefined,
    
    // Peak hours
    peakHours: timeStats.peakHours ? 
      `En çok işlem yapılan ${period === 'daily' ? 'saatler' : period === 'weekly' ? 'günler' : 'aylar'}: ${timeStats.peakHours}` : undefined,
    
    // Revenue change compared to previous period
    revenueChange: revenueStats.change ? 
      `${revenueStats.change}` : undefined,
    
    // Cancellation rate
    cancellationRate: customerStats.cancellationRate ? 
      `${customerStats.cancellationRate}` : undefined,
      
    // Most profitable category
    mostProfitableCategory: profitStats.mostProfitableCategory ? 
      `"${profitStats.mostProfitableCategory.name}" kategorisi en yüksek kârı sağlıyor (%${profitStats.mostProfitableCategory.profitMargin.toFixed(1)})` : undefined,
      
    // Least profitable service
    leastProfitableService: profitStats.leastProfitable ? 
      `"${profitStats.leastProfitable.name}" en düşük kârlılığa sahip (%${profitStats.leastProfitable.profitMargin.toFixed(1)})` : undefined,
      
    // Average profit margin
    averageProfitMargin: profitStats.averageProfitMargin ? 
      `Ortalama kârlılık oranı: %${profitStats.averageProfitMargin.toFixed(1)}` : undefined,
    
    // Flag to indicate data availability
    hasEnoughData
  };
}

function calculateServiceStatistics(operations: any[] = []) {
  // Map to store service statistics
  const serviceMap: Record<string, ServiceStat> = operations.reduce((acc: Record<string, ServiceStat>, op: any) => {
    // Get service name either from islem or description
    let serviceName = '';
    if (op.islem && op.islem.islem_adi) {
      serviceName = op.islem.islem_adi;
    } else if (op.aciklama) {
      serviceName = op.aciklama.split(' hizmeti verildi')[0];
    }
    
    if (!serviceName) return acc;
    
    if (!acc[serviceName]) {
      acc[serviceName] = {
        name: serviceName,
        count: 0,
        revenue: 0
      };
    }
    
    acc[serviceName].count++;
    acc[serviceName].revenue += (op.tutar || 0);
    
    return acc;
  }, {});
  
  // Convert to array
  const services: ServiceStat[] = Object.values(serviceMap);
  
  // Find most profitable service
  const mostProfitableService = services.length > 0 ? 
    services.sort((a, b) => b.revenue - a.revenue)[0] : null;
  
  // Find most popular service
  const mostPopularService = services.length > 0 ? 
    services.sort((a, b) => b.count - a.count)[0] : null;
  
  return {
    mostProfitable: mostProfitableService,
    mostPopular: mostPopularService,
    services
  };
}

function calculateCustomerStatistics(operations: any[] = [], appointments: any[] = []) {
  // Count unique customers
  const uniqueCustomers = new Set();
  operations.forEach((op: any) => {
    if (op.musteri_id) uniqueCustomers.add(op.musteri_id);
  });
  
  const uniqueCustomerCount = uniqueCustomers.size;
  
  // Calculate new vs returning customers
  const customerVisitCounts: Record<string | number, number> = operations.reduce((acc: Record<string | number, number>, op: any) => {
    if (!op.musteri_id) return acc;
    
    if (!acc[op.musteri_id]) {
      acc[op.musteri_id] = 0;
    }
    
    acc[op.musteri_id]++;
    return acc;
  }, {});
  
  const newCustomers = Object.values(customerVisitCounts).filter(count => count === 1).length;
  const returningCustomers = uniqueCustomerCount - newCustomers;
  
  // Calculate cancellation statistics
  const totalAppointments = appointments.length;
  const cancelledAppointments = appointments.filter((app: any) => app.durum === 'iptal').length;
  
  return {
    uniqueCustomerCount,
    newCustomers,
    returningCustomers,
    newVsReturningRatio: uniqueCustomerCount > 0 ? 
      `Yeni müşteriler: ${Math.round((newCustomers / uniqueCustomerCount) * 100)}%, Sadık müşteriler: ${Math.round((returningCustomers / uniqueCustomerCount) * 100)}%` : undefined,
    cancellationRate: totalAppointments > 0 ? 
      `Randevu iptal oranı: ${Math.round((cancelledAppointments / totalAppointments) * 100)}%` : undefined
  };
}

interface TimeEntry {
  key: string;
  count: number;
  revenue: number;
}

function calculateTimeStatistics(operations: any[] = [], appointments: any[] = [], period = 'daily') {
  // Time-based grouping based on period
  const timeGroups: Record<string, { count: number, revenue: number }> = operations.reduce((acc: Record<string, { count: number, revenue: number }>, op: any) => {
    if (!op.created_at) return acc;
    
    const date = new Date(op.created_at);
    let key = '';
    
    if (period === 'daily') {
      // Group by hour
      key = date.getHours().toString().padStart(2, '0') + ':00';
    } else if (period === 'weekly') {
      // Group by day
      const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      key = days[date.getDay()];
    } else if (period === 'monthly') {
      // Group by week
      const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
      key = `Hafta ${weekOfMonth}`;
    } else {
      // Group by month
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      key = months[date.getMonth()];
    }
    
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        revenue: 0
      };
    }
    
    acc[key].count++;
    acc[key].revenue += (op.tutar || 0);
    
    return acc;
  }, {});
  
  // Convert to array and sort by count
  const timeArray: TimeEntry[] = Object.entries(timeGroups)
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.count - a.count);
  
  // Get busiest times
  const busiest = timeArray.length > 0 ? 
    timeArray.slice(0, 3).map(t => t.key).join(', ') : undefined;
  
  // Get peak hours
  const peakHours = timeArray.length > 0 ? 
    timeArray[0].key : undefined;
  
  return {
    busiest,
    peakHours,
    timeArray
  };
}

function calculateRevenueStatistics(operations: any[] = [], period = 'daily') {
  // Calculate total revenue
  const totalRevenue = operations.reduce((sum: number, op: any) => sum + (op.tutar || 0), 0);
  
  // Calculate average spending per customer
  const uniqueCustomers = new Set(operations.map((op: any) => op.musteri_id).filter(Boolean));
  const averageSpending = uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;
  
  // Period comparisons would need historical data
  // For now, just report the average
  return {
    totalRevenue,
    averageSpending,
    averageSpendingChange: averageSpending > 0 ? 
      `${averageSpending.toLocaleString()} TL` : undefined,
    change: totalRevenue > 0 ? 
      `Toplam ciro: ${totalRevenue.toLocaleString()} TL` : undefined
  };
}

function calculateProfitStatistics(operations: any[] = []) {
  // Service profit calculation
  const serviceMap: Record<string, ServiceStat> = operations.reduce((acc: Record<string, ServiceStat>, op: any) => {
    // Get service name, cost and revenue from operation
    const serviceName = op.islem?.islem_adi || op.aciklama?.split(' hizmeti verildi')[0] || 'Bilinmeyen';
    const cost = (op.islem?.maliyet || 0) + (op.odenen || 0); // Malzeme + Personel gideri
    const revenue = op.tutar || 0;
    
    if (!acc[serviceName]) {
      acc[serviceName] = {
        name: serviceName,
        count: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: 0
      };
    }
    
    acc[serviceName].count++;
    acc[serviceName].revenue += revenue;
    acc[serviceName].cost = (acc[serviceName].cost || 0) + cost;
    
    return acc;
  }, {});
  
  // Calculate profit metrics for each service
  const services = Object.values(serviceMap).map(service => {
    const profit = service.revenue - (service.cost || 0);
    const profitMargin = service.revenue > 0 ? (profit / service.revenue) * 100 : 0;
    
    return {
      ...service,
      profit,
      profitMargin
    };
  });
  
  // Category profit calculation
  const categoryMap: Record<string, ServiceStat> = operations.reduce((acc: Record<string, ServiceStat>, op: any) => {
    if (!op.islem?.kategori_id) return acc;
    
    // Get category name from the operation
    const categoryName = op.islem.kategori_adi || 'Kategorisiz';
    const cost = (op.islem?.maliyet || 0) + (op.odenen || 0);
    const revenue = op.tutar || 0;
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        count: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: 0
      };
    }
    
    acc[categoryName].count++;
    acc[categoryName].revenue += revenue;
    acc[categoryName].cost = (acc[categoryName].cost || 0) + cost;
    
    return acc;
  }, {});
  
  // Calculate profit metrics for each category
  const categories = Object.values(categoryMap).map(category => {
    const profit = category.revenue - (category.cost || 0);
    const profitMargin = category.revenue > 0 ? (profit / category.revenue) * 100 : 0;
    
    return {
      ...category,
      profit,
      profitMargin
    };
  });
  
  // Find most profitable and least profitable services
  const sortedByProfit = [...services].sort((a, b) => (b.profitMargin || 0) - (a.profitMargin || 0));
  const mostProfitable = sortedByProfit.length > 0 ? sortedByProfit[0] : null;
  const leastProfitable = sortedByProfit.length > 0 ? sortedByProfit[sortedByProfit.length - 1] : null;
  
  // Find most profitable category
  const sortedCategoriesByProfit = [...categories].sort((a, b) => (b.profitMargin || 0) - (a.profitMargin || 0));
  const mostProfitableCategory = sortedCategoriesByProfit.length > 0 ? sortedCategoriesByProfit[0] : null;
  
  // Calculate average profit margin
  const totalProfitMargin = services.reduce((sum, service) => sum + (service.profitMargin || 0), 0);
  const averageProfitMargin = services.length > 0 ? totalProfitMargin / services.length : 0;
  
  return {
    mostProfitable,
    leastProfitable,
    mostProfitableCategory,
    averageProfitMargin,
    services,
    categories
  };
}
