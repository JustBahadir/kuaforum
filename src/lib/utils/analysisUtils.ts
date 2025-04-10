import { PersonelIslemi } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";
import { format, startOfDay, endOfDay, differenceInDays, isPast, isFuture } from "date-fns";

// Function to analyze shop statistics data
export function analyzeShopData(
  operations: any[] = [],
  appointments: any[] = [],
  period: string = "daily"
): {
  mostProfitableService: string;
  mostPopularService: string;
  busiestDays: string;
  averageSpendingChange: string;
  customerRatio: string;
  peakHours: string;
  revenueChange: string;
  cancellationRate: string;
  hasEnoughData: boolean;
} {
  // Check if there's enough data
  if (operations.length < 3 || appointments.length < 3) {
    return {
      mostProfitableService: "",
      mostPopularService: "",
      busiestDays: "",
      averageSpendingChange: "",
      customerRatio: "",
      peakHours: "",
      revenueChange: "",
      cancellationRate: "",
      hasEnoughData: false,
    };
  }

  // Most profitable service
  const serviceRevenue: Record<string, { count: number; revenue: number }> = {};
  operations.forEach((op) => {
    const serviceName = op.islem?.islem_adi || op.aciklama || "Bilinmeyen Hizmet";
    if (!serviceRevenue[serviceName]) {
      serviceRevenue[serviceName] = { count: 0, revenue: 0 };
    }
    serviceRevenue[serviceName].count += 1;
    serviceRevenue[serviceName].revenue += op.tutar || 0;
  });

  const serviceRevenueArray = Object.entries(serviceRevenue).map(
    ([name, data]) => ({
      name,
      ...data,
    })
  );

  // Sort by revenue
  const sortedByRevenue = [...serviceRevenueArray].sort(
    (a, b) => b.revenue - a.revenue
  );
  
  // Sort by count
  const sortedByCount = [...serviceRevenueArray].sort(
    (a, b) => b.count - a.count
  );

  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  
  // Period-specific message for the most profitable service
  let mostProfitableService = "";
  if (sortedByRevenue.length > 0) {
    const percentage = Math.round((sortedByRevenue[0].revenue / totalRevenue) * 100);
    
    switch (period) {
      case "daily":
        mostProfitableService = `Bugün en çok gelir sağlayan hizmet %${percentage} ile '${sortedByRevenue[0].name}' oldu.`;
        break;
      case "weekly":
        mostProfitableService = `Bu hafta en çok gelir sağlayan hizmet %${percentage} ile '${sortedByRevenue[0].name}' oldu.`;
        break;
      case "monthly":
        mostProfitableService = `Bu ay en çok gelir sağlayan hizmet %${percentage} ile '${sortedByRevenue[0].name}' oldu.`;
        break;
      case "yearly":
        mostProfitableService = `Bu yıl en çok gelir sağlayan hizmet %${percentage} ile '${sortedByRevenue[0].name}' oldu.`;
        break;
      default:
        mostProfitableService = `Seçili dönemde en çok gelir sağlayan hizmet %${percentage} ile '${sortedByRevenue[0].name}' oldu.`;
    }
  } else {
    mostProfitableService = "Henüz yeterli gelir verisi bulunmuyor.";
  }

  const totalAppointments = appointments.length;
  let mostPopularService = "";
  if (sortedByCount.length > 0) {
    const percentage = Math.round((sortedByCount[0].count / totalAppointments) * 100);
    
    switch (period) {
      case "daily":
        mostPopularService = `Bugün '${sortedByCount[0].name}', toplam işlemlerin %${percentage}'sını oluşturdu.`;
        break;
      case "weekly":
        mostPopularService = `Bu hafta '${sortedByCount[0].name}', toplam işlemlerin %${percentage}'sını oluşturdu.`;
        break;
      case "monthly":
        mostPopularService = `Bu ay '${sortedByCount[0].name}', toplam işlemlerin %${percentage}'sını oluşturdu.`;
        break;
      case "yearly":
        mostPopularService = `Bu yıl '${sortedByCount[0].name}', toplam işlemlerin %${percentage}'sını oluşturdu.`;
        break;
      default:
        mostPopularService = `Seçilen dönemde '${sortedByCount[0].name}', toplam işlemlerin %${percentage}'sını oluşturdu.`;
    }
  } else {
    mostPopularService = "Henüz yeterli randevu verisi bulunmuyor.";
  }

  // Analyze busiest days
  const dayDistribution: Record<number, number> = {};
  appointments.forEach((app) => {
    if (app.tarih) {
      const day = new Date(app.tarih).getDay();
      dayDistribution[day] = (dayDistribution[day] || 0) + 1;
    }
  });

  // Find the two busiest days
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const sortedDays = Object.entries(dayDistribution)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 2)
    .map(([dayIndex]) => days[Number(dayIndex)]);

  let busiestDays = "";
  switch (period) {
    case "daily":
      busiestDays = "Günlük analizde en yoğun gün verisi bulunmaz.";
      break;
    default:
      busiestDays = sortedDays.length >= 2
        ? `${sortedDays[0]} ve ${sortedDays[1]} günleri seçilen dönemin en yoğun günleri oldu.`
        : sortedDays.length === 1
        ? `${sortedDays[0]} günü seçilen dönemin en yoğun günü oldu.`
        : "Henüz yeterli gün dağılımı verisi bulunmuyor.";
  }

  // Calculate customer spending trend compared to previous period
  const now = new Date();
  
  // Group operations by date for trend analysis
  const operationsByDate: Record<string, { count: number; revenue: number; }> = {};
  
  operations.forEach(op => {
    if (!op.created_at) return;
    const date = format(new Date(op.created_at), 'yyyy-MM-dd');
    
    if (!operationsByDate[date]) {
      operationsByDate[date] = { count: 0, revenue: 0 };
    }
    
    operationsByDate[date].count += 1;
    operationsByDate[date].revenue += op.tutar || 0;
  });
  
  // Get sorted dates
  const sortedDates = Object.keys(operationsByDate).sort();
  
  // Split into two halves for comparison
  const halfPoint = Math.floor(sortedDates.length / 2);
  const firstHalfDates = sortedDates.slice(0, halfPoint);
  const secondHalfDates = sortedDates.slice(halfPoint);
  
  // Calculate averages for each half
  const firstHalfAvg = firstHalfDates.reduce((sum, date) => {
    const ops = operationsByDate[date];
    return sum + (ops.revenue / ops.count);
  }, 0) / (firstHalfDates.length || 1);
  
  const secondHalfAvg = secondHalfDates.reduce((sum, date) => {
    const ops = operationsByDate[date];
    return sum + (ops.revenue / ops.count);
  }, 0) / (secondHalfDates.length || 1);

  let averageSpendingChange = "Karşılaştırma için yeterli veri yok.";
  if (firstHalfAvg > 0 && secondHalfAvg > 0) {
    const changePercent = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
    
    if (Math.abs(changePercent) >= 5) {  // Only show significant changes
      averageSpendingChange = `Ortalama müşteri harcaması %${Math.abs(changePercent)} ${
        changePercent > 0 ? "arttı" : "azaldı"
      }.`;
    } else {
      averageSpendingChange = "Ortalama harcamada önemli bir değişiklik görülmüyor.";
    }
  }

  // Calculate new vs returning customer ratio
  const allCustomers = new Set();
  const newCustomers = new Set();
  const recentAppointments = appointments.sort((a, b) => {
    const dateA = new Date(a.tarih);
    const dateB = new Date(b.tarih);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Identify all customers and determine which ones are new
  recentAppointments.forEach(app => {
    if (!app.tarih || !app.musteri_id) return;
    
    if (!allCustomers.has(app.musteri_id)) {
      allCustomers.add(app.musteri_id);
      
      // First time we're seeing this customer in the sorted list
      const appDate = new Date(app.tarih);
      
      // Check if this is earliest appointment for this customer
      const earliestAppointment = appointments.find(a => 
        a.musteri_id === app.musteri_id && 
        new Date(a.tarih) < appDate
      );
      
      if (!earliestAppointment) {
        newCustomers.add(app.musteri_id);
      }
    }
  });
  
  const newCustomerPercentage = allCustomers.size > 0
    ? Math.round((newCustomers.size / allCustomers.size) * 100)
    : 0;
  
  let customerRatio = "";
  switch (period) {
    case "daily":
      customerRatio = `Bugün müşterilerin %${newCustomerPercentage}'ı ilk kez geldi.`;
      break;
    case "weekly":
      customerRatio = `Bu hafta müşterilerin %${newCustomerPercentage}'ı ilk kez geldi.`;
      break;
    case "monthly":
      customerRatio = `Bu ay müşterilerin %${newCustomerPercentage}'ı ilk kez geldi.`;
      break;
    case "yearly":
      customerRatio = `Bu yıl müşterilerin %${newCustomerPercentage}'ı ilk kez geldi.`;
      break;
    default:
      customerRatio = `Seçili dönemde müşterilerin %${newCustomerPercentage}'ı ilk kez geldi.`;
  }

  // Peak hours analysis
  const hourDistribution: Record<number, number> = {};
  appointments.forEach(app => {
    if (!app.saat) return;
    const timeStr = app.saat.toString();
    let hour = 0;
    
    // Parse hour from time string (could be in different formats)
    if (timeStr.includes(':')) {
      hour = parseInt(timeStr.split(':')[0]);
    } else if (timeStr.length >= 2) {
      hour = parseInt(timeStr.substring(0, 2));
    }
    
    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
  });
  
  // Find peak hour
  let peakHour = 0;
  let peakCount = 0;
  
  Object.entries(hourDistribution).forEach(([hourStr, count]) => {
    if (count > peakCount) {
      peakCount = count;
      peakHour = parseInt(hourStr);
    }
  });
  
  const formatHour = (hour: number) => {
    return `${hour}:00 - ${hour + 1}:00`;
  };
  
  const peakHours = peakCount > 0 
    ? `En yoğun saat aralığı ${formatHour(peakHour)} (${peakCount} randevu).`
    : "Yoğun saat aralığı tespiti için yeterli veri yok.";

  // Revenue change analysis
  const revenueChange = calculateRevenueChange(operations, period);

  // Appointment cancellation rate
  const cancelledAppointments = appointments.filter(app => app.durum === 'iptal').length;
  const cancellationRate = appointments.length > 0 
    ? `Randevu iptal oranı: %${Math.round((cancelledAppointments / appointments.length) * 100)}.`
    : "İptal oranı verisi için yeterli randevu yok.";

  return {
    mostProfitableService,
    mostPopularService,
    busiestDays,
    averageSpendingChange,
    customerRatio,
    peakHours,
    revenueChange,
    cancellationRate,
    hasEnoughData: true,
  };
}

function calculateRevenueChange(operations: any[], period: string): string {
  if (operations.length < 5) return "Ciro değişim analizi için yeterli veri yok.";
  
  // Sort operations by date
  const sortedOps = [...operations].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Split into two periods for comparison
  const halfIndex = Math.floor(sortedOps.length / 2);
  const firstHalf = sortedOps.slice(0, halfIndex);
  const secondHalf = sortedOps.slice(halfIndex);
  
  const firstHalfRevenue = firstHalf.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const secondHalfRevenue = secondHalf.reduce((sum, op) => sum + (op.tutar || 0), 0);
  
  if (firstHalfRevenue === 0) return "Önceki dönem verisi bulunamadı.";
  
  const changePercent = Math.round(((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100);
  
  let timePeriod = "";
  switch (period) {
    case "daily": timePeriod = "günün ilk yarısına"; break;
    case "weekly": timePeriod = "haftanın ilk yarısına"; break;
    case "monthly": timePeriod = "ayın ilk yarısına"; break;
    case "yearly": timePeriod = "yılın ilk yarısına"; break;
    default: timePeriod = "önceki döneme";
  }
  
  if (Math.abs(changePercent) < 5) {
    return `Ciro ${timePeriod} göre stabil seyrediyor.`;
  }
  
  return `Ciro ${timePeriod} göre %${Math.abs(changePercent)} ${changePercent > 0 ? "artış" : "düşüş"} gösterdi.`;
}

// Function to analyze personnel data
export function analyzePersonnelData(
  operations: PersonelIslemi[] = [],
  personnel: any[] = []
): {
  mostOperationsStaff: string;
  mostRevenueStaff: string;
  highestPointsStaff: string;
  serviceSpecializations: string;
  hasEnoughData: boolean;
} {
  // Check if there's enough data
  if (operations.length < 5 || personnel.length === 0) {
    return {
      mostOperationsStaff: "",
      mostRevenueStaff: "",
      highestPointsStaff: "",
      serviceSpecializations: "",
      hasEnoughData: false,
    };
  }

  // Create a map of personnel stats
  const personnelStats: Record<
    number,
    {
      name: string;
      operationCount: number;
      revenue: number;
      points: number;
      services: Record<string, number>;
    }
  > = {};

  // Initialize personnel stats
  personnel.forEach((person) => {
    personnelStats[person.id] = {
      name: person.ad_soyad,
      operationCount: 0,
      revenue: 0,
      points: 0,
      services: {},
    };
  });

  // Aggregate operations data
  operations.forEach((op) => {
    if (!op.personel_id || !personnelStats[op.personel_id]) return;

    const stats = personnelStats[op.personel_id];
    stats.operationCount += 1;
    stats.revenue += op.tutar || 0;
    stats.points += op.puan || 0;
    
    const serviceName = op.islem?.islem_adi || op.aciklama || "Bilinmeyen Hizmet";
    stats.services[serviceName] = (stats.services[serviceName] || 0) + 1;
  });

  // Convert to array and sort for analysis
  const statsArray = Object.values(personnelStats);

  // Most operations
  const mostOperationsPersonnel = [...statsArray].sort(
    (a, b) => b.operationCount - a.operationCount
  )[0];

  const mostOperationsStaff = mostOperationsPersonnel?.operationCount > 0
    ? `${mostOperationsPersonnel.name} bu ay ${mostOperationsPersonnel.operationCount} işlemle birinci sırada.`
    : "Henüz yeterli işlem verisi bulunmuyor.";

  // Most revenue
  const mostRevenuePersonnel = [...statsArray].sort(
    (a, b) => b.revenue - a.revenue
  )[0];

  const mostRevenueStaff = mostRevenuePersonnel?.revenue > 0
    ? `Toplam ${formatCurrency(mostRevenuePersonnel.revenue)} kazandıran ${
        mostRevenuePersonnel.name
      } lider durumda.`
    : "Henüz yeterli gelir verisi bulunmuyor.";

  // Highest points - Replacing the previous rating-based metric
  const personnelWithPoints = statsArray.filter(
    (p) => p.points > 0
  );
  
  const highestPointsPersonnel = [...personnelWithPoints].sort(
    (a, b) => b.points - a.points
  )[0];

  const highestPointsStaff = highestPointsPersonnel
    ? `Toplam ${highestPointsPersonnel.points} puanla en yüksek puana sahip personel: ${
        highestPointsPersonnel.name
      }.`
    : "Henüz yeterli puan verisi bulunmuyor.";

  // Service specialization
  let serviceSpecialist = null;
  let highestPercentage = 0;

  statsArray.forEach((person) => {
    if (person.operationCount === 0) return;

    const services = Object.entries(person.services);
    if (services.length === 0) return;

    const [topService, count] = services.sort((a, b) => b[1] - a[1])[0];
    const percentage = (count / person.operationCount) * 100;

    if (percentage > 50 && percentage > highestPercentage) {
      serviceSpecialist = {
        name: person.name,
        service: topService,
        percentage: Math.round(percentage),
      };
      highestPercentage = percentage;
    }
  });

  const serviceSpecializations = serviceSpecialist
    ? `${serviceSpecialist.name}, işlemlerinin %${serviceSpecialist.percentage}'ini ${serviceSpecialist.service} kategorisinde yaptı.`
    : "Personelin belirgin bir hizmet uzmanlaşması görünmüyor.";

  return {
    mostOperationsStaff,
    mostRevenueStaff,
    highestPointsStaff,
    serviceSpecializations,
    hasEnoughData: true,
  };
}
