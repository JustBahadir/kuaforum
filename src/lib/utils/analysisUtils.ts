
// A utility function to generate insights from shop data
export function analyzeShopData(operations: any[], appointments: any[], period: string = "daily") {
  const hasEnoughData = operations.length >= 5;
  const insights: string[] = [];
  
  // Don't generate insights if not enough data
  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      mostProfitableService: "Veri analizi için yeterli işlem bulunmuyor.",
      mostPopularService: null,
      busiestDays: null,
      peakHours: null,
      revenueChange: null,
      customerRatio: null,
      cancellationRate: null,
      averageSpendingChange: null
    };
  }
  
  // Calculate most profitable service
  const serviceRevenue: Record<string, { revenue: number, count: number }> = {};
  operations.forEach(op => {
    const serviceName = getServiceName(op);
    if (!serviceRevenue[serviceName]) {
      serviceRevenue[serviceName] = { revenue: 0, count: 0 };
    }
    serviceRevenue[serviceName].revenue += op.tutar || 0;
    serviceRevenue[serviceName].count += 1;
  });
  
  let mostProfitableService = "Henüz veri yok";
  let highestRevenue = 0;
  Object.entries(serviceRevenue).forEach(([name, data]) => {
    if (data.revenue > highestRevenue) {
      mostProfitableService = name;
      highestRevenue = data.revenue;
    }
  });
  
  // Calculate most popular service by count
  let mostPopularService = "Henüz veri yok";
  let highestCount = 0;
  Object.entries(serviceRevenue).forEach(([name, data]) => {
    if (data.count > highestCount) {
      mostPopularService = name;
      highestCount = data.count;
    }
  });
  
  // Find busiest days
  const dayCount: Record<number, number> = {};
  operations.forEach(op => {
    if (op.created_at) {
      const date = new Date(op.created_at);
      const day = date.getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    }
  });
  
  let busiestDay = "Henüz veri yok";
  let highestDayCount = 0;
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  Object.entries(dayCount).forEach(([day, count]) => {
    if (count > highestDayCount) {
      busiestDay = days[parseInt(day)];
      highestDayCount = count;
    }
  });
  
  // Find peak hours
  const hourCount: Record<number, number> = {};
  operations.forEach(op => {
    if (op.created_at) {
      const date = new Date(op.created_at);
      const hour = date.getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    }
  });
  
  let peakHour = "Henüz veri yok";
  let highestHourCount = 0;
  Object.entries(hourCount).forEach(([hour, count]) => {
    if (count > highestHourCount) {
      peakHour = `${hour}:00`;
      highestHourCount = count;
    }
  });
  
  // Calculate revenue change compared to previous period
  let revenueChange = null;
  if (operations.length > 0) {
    try {
      // Sort operations by date
      const sortedOps = [...operations].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Divide into two equal time periods
      const midPoint = Math.floor(sortedOps.length / 2);
      const firstPeriodRevenue = sortedOps.slice(0, midPoint).reduce((sum, op) => sum + (op.tutar || 0), 0);
      const secondPeriodRevenue = sortedOps.slice(midPoint).reduce((sum, op) => sum + (op.tutar || 0), 0);
      
      // Calculate percentage change
      if (firstPeriodRevenue > 0) {
        const percentage = ((secondPeriodRevenue - firstPeriodRevenue) / firstPeriodRevenue) * 100;
        const direction = percentage >= 0 ? "artış" : "düşüş";
        revenueChange = `Gelirlerinizde %${Math.abs(percentage).toFixed(1)} ${direction} var.`;
      }
    } catch (error) {
      console.error("Revenue change calculation error:", error);
    }
  }
  
  // Calculate customer ratio (new vs returning)
  let customerRatio = null;
  if (operations.length > 0) {
    try {
      const customers = new Set();
      let newCustomerCount = 0;
      let returningCustomerCount = 0;
      
      operations.forEach(op => {
        const customerId = op.musteri_id;
        if (!customerId) return;
        
        if (customers.has(customerId)) {
          returningCustomerCount++;
        } else {
          customers.add(customerId);
          newCustomerCount++;
        }
      });
      
      const totalCustomers = newCustomerCount + returningCustomerCount;
      if (totalCustomers > 0) {
        const newPercentage = (newCustomerCount / totalCustomers) * 100;
        customerRatio = `Müşterilerinizin %${newPercentage.toFixed(0)}'i ilk kez geldi.`;
      }
    } catch (error) {
      console.error("Customer ratio calculation error:", error);
    }
  }
  
  // Calculate appointment cancellation rate
  let cancellationRate = null;
  if (appointments.length > 0) {
    try {
      const cancelledCount = appointments.filter(app => app.durum === 'iptal').length;
      const rate = (cancelledCount / appointments.length) * 100;
      cancellationRate = `Randevu iptal oranınız %${rate.toFixed(1)}.`;
      
      // Add interpretation
      if (rate > 20) {
        cancellationRate += " Bu oran yüksek, müşterilerinize randevu hatırlatmaları göndermeyi düşünebilirsiniz.";
      } else if (rate < 5) {
        cancellationRate += " Bu oran oldukça düşük, harika bir randevu yönetimi yapıyorsunuz!";
      }
    } catch (error) {
      console.error("Cancellation rate calculation error:", error);
    }
  }
  
  // Calculate average spending change
  let averageSpendingChange = null;
  if (operations.length > 0) {
    try {
      const customerSpending: Record<string, { total: number, count: number, dates: Date[] }> = {};
      
      operations.forEach(op => {
        const customerId = String(op.musteri_id);
        if (!customerId) return;
        const date = new Date(op.created_at);
        
        if (!customerSpending[customerId]) {
          customerSpending[customerId] = { total: 0, count: 0, dates: [] };
        }
        
        customerSpending[customerId].total += op.tutar || 0;
        customerSpending[customerId].count += 1;
        customerSpending[customerId].dates.push(date);
      });
      
      // Find customers with multiple visits
      const returningCustomers = Object.entries(customerSpending)
        .filter(([_, data]) => data.count > 1)
        .map(([id, data]) => ({
          id,
          firstVisitSpending: 0,
          recentVisitSpending: 0,
          dates: data.dates.sort((a, b) => a.getTime() - b.getTime())
        }));
      
      if (returningCustomers.length > 0) {
        // For each returning customer, calculate spending change
        const changes: number[] = [];
        
        returningCustomers.forEach(customer => {
          const firstVisitOps = operations.filter(op => 
            String(op.musteri_id) === customer.id && 
            new Date(op.created_at).getTime() === customer.dates[0].getTime()
          );
          
          const lastVisitOps = operations.filter(op => 
            String(op.musteri_id) === customer.id && 
            new Date(op.created_at).getTime() === customer.dates[customer.dates.length - 1].getTime()
          );
          
          const firstVisitTotal = firstVisitOps.reduce((sum, op) => sum + (op.tutar || 0), 0);
          const lastVisitTotal = lastVisitOps.reduce((sum, op) => sum + (op.tutar || 0), 0);
          
          if (firstVisitTotal > 0) {
            const change = ((lastVisitTotal - firstVisitTotal) / firstVisitTotal) * 100;
            changes.push(change);
          }
        });
        
        if (changes.length > 0) {
          const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
          const direction = avgChange >= 0 ? "arttı" : "azaldı";
          averageSpendingChange = `Düzenli müşterilerinizin ortalama harcaması %${Math.abs(avgChange).toFixed(1)} ${direction}.`;
        }
      }
    } catch (error) {
      console.error("Average spending change calculation error:", error);
    }
  }
  
  // Format insights based on period
  if (period === "daily") {
    return {
      hasEnoughData,
      mostProfitableService: `Bugünün en kazandıran işlemi: ${mostProfitableService}.`,
      mostPopularService: `En çok tercih edilen işlem: ${highestCount} kez ${mostPopularService}.`,
      peakHours: `En yoğun saat dilimi: ${peakHour}.`,
      busiestDays: null,
      revenueChange,
      customerRatio,
      cancellationRate: null,
      averageSpendingChange: null
    };
  } else if (period === "weekly") {
    return {
      hasEnoughData,
      mostProfitableService: `Bu haftanın en kazandıran işlemi: ${mostProfitableService}.`,
      mostPopularService: `En çok tercih edilen işlem: ${highestCount} kez ${mostPopularService}.`,
      busiestDays: `Haftanın en yoğun günü: ${busiestDay}.`,
      peakHours: `En yoğun saat dilimi: ${peakHour}.`,
      revenueChange,
      customerRatio,
      cancellationRate,
      averageSpendingChange
    };
  } else {
    return {
      hasEnoughData,
      mostProfitableService: `Bu dönemin en kazandıran işlemi: ${mostProfitableService}.`,
      mostPopularService: `En çok tercih edilen işlem: ${highestCount} kez ${mostPopularService}.`,
      busiestDays: `En yoğun gün: ${busiestDay}.`,
      peakHours: `En yoğun saat dilimi: ${peakHour}.`,
      revenueChange,
      customerRatio,
      cancellationRate,
      averageSpendingChange
    };
  }
}

// A utility function to generate insights from personnel data
export function analyzePersonnelData(operations: any[], period: string = "daily") {
  const hasEnoughData = operations.length >= 3;
  
  // Don't generate insights if not enough data
  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      mostProfitableService: "Veri analizi için yeterli işlem bulunmuyor.",
      mostPopularService: null,
      busiestDays: null,
      revenueChange: null
    };
  }
  
  // Calculate most profitable service
  const serviceRevenue: Record<string, { revenue: number, count: number }> = {};
  operations.forEach(op => {
    const serviceName = getServiceName(op);
    if (!serviceRevenue[serviceName]) {
      serviceRevenue[serviceName] = { revenue: 0, count: 0 };
    }
    serviceRevenue[serviceName].revenue += op.tutar || 0;
    serviceRevenue[serviceName].count += 1;
  });
  
  let mostProfitableService = "Henüz veri yok";
  let highestRevenue = 0;
  Object.entries(serviceRevenue).forEach(([name, data]) => {
    if (data.revenue > highestRevenue) {
      mostProfitableService = name;
      highestRevenue = data.revenue;
    }
  });
  
  // Calculate most popular service by count
  let mostPopularService = "Henüz veri yok";
  let highestCount = 0;
  Object.entries(serviceRevenue).forEach(([name, data]) => {
    if (data.count > highestCount) {
      mostPopularService = name;
      highestCount = data.count;
    }
  });
  
  // Find busiest days
  const dayCount: Record<number, number> = {};
  operations.forEach(op => {
    if (op.created_at) {
      const date = new Date(op.created_at);
      const day = date.getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    }
  });
  
  let busiestDay = "Henüz veri yok";
  let highestDayCount = 0;
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  Object.entries(dayCount).forEach(([day, count]) => {
    if (count > highestDayCount) {
      busiestDay = days[parseInt(day)];
      highestDayCount = count;
    }
  });
  
  // Calculate revenue change
  let revenueChange = null;
  if (operations.length > 0) {
    try {
      // Sort operations by date
      const sortedOps = [...operations].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Divide into two equal time periods
      const midPoint = Math.floor(sortedOps.length / 2);
      const firstPeriodRevenue = sortedOps.slice(0, midPoint).reduce((sum, op) => sum + (op.tutar || 0), 0);
      const secondPeriodRevenue = sortedOps.slice(midPoint).reduce((sum, op) => sum + (op.tutar || 0), 0);
      
      // Calculate percentage change
      if (firstPeriodRevenue > 0) {
        const percentage = ((secondPeriodRevenue - firstPeriodRevenue) / firstPeriodRevenue) * 100;
        const direction = percentage >= 0 ? "artış" : "düşüş";
        revenueChange = `Gelirlerde %${Math.abs(percentage).toFixed(1)} ${direction} kaydedildi.`;
      }
    } catch (error) {
      console.error("Revenue change calculation error:", error);
    }
  }

  // Format insights based on period
  if (period === "daily") {
    return {
      hasEnoughData,
      mostProfitableService: `Bugünün en kazandıran işlemi: ${mostProfitableService}.`,
      mostPopularService: `En çok yapılan işlem: ${highestCount} kez ${mostPopularService}.`,
      busiestDays: null,
      revenueChange
    };
  } else if (period === "weekly") {
    return {
      hasEnoughData,
      mostProfitableService: `Bu haftanın en kazandıran işlemi: ${mostProfitableService}.`,
      mostPopularService: `En çok yapılan işlem: ${highestCount} kez ${mostPopularService}.`,
      busiestDays: `En verimli gün: ${busiestDay}.`,
      revenueChange
    };
  } else {
    return {
      hasEnoughData,
      mostProfitableService: `Bu dönemin en kazandıran işlemi: ${mostProfitableService}.`,
      mostPopularService: `En çok yapılan işlem: ${highestCount} kez ${mostPopularService}.`,
      busiestDays: `En verimli gün: ${busiestDay}.`,
      revenueChange
    };
  }
}

// Helper function to get service name from operation
function getServiceName(operation: any): string {
  if (operation.islem?.islem_adi) {
    return operation.islem.islem_adi;
  } else if (operation.aciklama) {
    // Try to parse service name from description
    if (operation.aciklama.includes(' hizmeti verildi')) {
      return operation.aciklama.split(' hizmeti verildi')[0];
    }
    return operation.aciklama;
  }
  return "Bilinmeyen İşlem";
}
