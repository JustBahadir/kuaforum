
type AnalysisData = {
  mostProfitableService?: string;
  mostPopularService?: string;
  busiestDays?: string;
  averageSpendingChange?: string;
  customerRatio?: string;
  peakHours?: string;
  revenueChange?: string;
  cancellationRate?: string;
  hasEnoughData: boolean;
};

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
  
  return {
    // Most profitable service
    mostProfitableService: serviceStats.mostProfitable ? 
      `"${serviceStats.mostProfitable.name}" en yüksek karı sağlıyor (${serviceStats.mostProfitable.revenue.toLocaleString()} TL)` : undefined,
    
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
    
    // Flag to indicate data availability
    hasEnoughData
  };
}

function calculateServiceStatistics(operations = []) {
  // Map to store service statistics
  const serviceMap = operations.reduce((acc, op) => {
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
  const services = Object.values(serviceMap);
  
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

function calculateCustomerStatistics(operations = [], appointments = []) {
  // Count unique customers
  const uniqueCustomers = new Set();
  operations.forEach(op => {
    if (op.musteri_id) uniqueCustomers.add(op.musteri_id);
  });
  
  const uniqueCustomerCount = uniqueCustomers.size;
  
  // Calculate new vs returning customers
  const customerVisitCounts = operations.reduce((acc, op) => {
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
  const cancelledAppointments = appointments.filter(app => app.durum === 'iptal').length;
  
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

function calculateTimeStatistics(operations = [], appointments = [], period = 'daily') {
  // Time-based grouping based on period
  const timeGroups = operations.reduce((acc, op) => {
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
  const timeArray = Object.entries(timeGroups)
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

function calculateRevenueStatistics(operations = [], period = 'daily') {
  // Calculate total revenue
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  
  // Calculate average spending per customer
  const uniqueCustomers = new Set(operations.map(op => op.musteri_id).filter(Boolean));
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
