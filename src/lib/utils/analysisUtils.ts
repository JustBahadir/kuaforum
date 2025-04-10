
import { PersonelIslemi } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

// Function to analyze shop statistics data
export function analyzeShopData(
  operations: any[] = [],
  appointments: any[] = []
): {
  mostProfitableService: string;
  mostPopularService: string;
  busiestDays: string;
  averageSpendingChange: string;
  customerRatio: string;
  hasEnoughData: boolean;
} {
  // Check if there's enough data
  if (operations.length < 5 || appointments.length < 5) {
    return {
      mostProfitableService: "",
      mostPopularService: "",
      busiestDays: "",
      averageSpendingChange: "",
      customerRatio: "",
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
  
  const mostProfitableService = sortedByRevenue.length > 0 
    ? `Bu ay en çok gelir sağlayan hizmet %${Math.round((sortedByRevenue[0].revenue / totalRevenue) * 100)} ile '${sortedByRevenue[0].name}' oldu.`
    : "Henüz yeterli gelir verisi bulunmuyor.";

  const totalAppointments = appointments.length;
  const mostPopularService = sortedByCount.length > 0
    ? `'${sortedByCount[0].name}', toplam randevuların %${Math.round((sortedByCount[0].count / totalAppointments) * 100)}'sını oluşturdu.`
    : "Henüz yeterli randevu verisi bulunmuyor.";

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

  const busiestDays = sortedDays.length >= 2
    ? `${sortedDays[0]} ve ${sortedDays[1]} günleri haftanın en yoğun günleri oldu.`
    : sortedDays.length === 1
    ? `${sortedDays[0]} günü haftanın en yoğun günü oldu.`
    : "Henüz yeterli gün dağılımı verisi bulunmuyor.";

  // Calculate customer spending trend compared to previous period
  // Now we're using actual data for comparison instead of random
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  
  const thisMonthOps = operations.filter(op => {
    if (!op.created_at) return false;
    const date = new Date(op.created_at);
    return date.getMonth() === thisMonth;
  });
  
  const lastMonthOps = operations.filter(op => {
    if (!op.created_at) return false;
    const date = new Date(op.created_at);
    return date.getMonth() === lastMonth;
  });
  
  const thisMonthAvg = thisMonthOps.length > 0 
    ? thisMonthOps.reduce((sum, op) => sum + (op.tutar || 0), 0) / thisMonthOps.length 
    : 0;
  
  const lastMonthAvg = lastMonthOps.length > 0 
    ? lastMonthOps.reduce((sum, op) => sum + (op.tutar || 0), 0) / lastMonthOps.length 
    : 0;

  let averageSpendingChange = "Geçmiş ay verileri karşılaştırma için yetersiz.";
  if (lastMonthAvg > 0 && thisMonthAvg > 0) {
    const changePercent = Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100);
    if (changePercent !== 0) {
      averageSpendingChange = `Ortalama harcama geçen aya göre %${Math.abs(changePercent)} ${
        changePercent > 0 ? "arttı" : "azaldı"
      }.`;
    } else {
      averageSpendingChange = "Ortalama harcamada geçen aya göre önemli bir değişiklik olmadı.";
    }
  }

  // Calculate new vs returning customer ratio
  const thisMonthCustomers = new Set();
  const newCustomers = new Set();
  
  appointments.forEach(app => {
    if (!app.tarih) return;
    const date = new Date(app.tarih);
    if (date.getMonth() === thisMonth && date.getFullYear() === now.getFullYear()) {
      thisMonthCustomers.add(app.musteri_id);
      
      // Check if this customer had appointments before this month
      const hadPreviousAppointments = appointments.some(prevApp => {
        if (!prevApp.tarih || prevApp.musteri_id !== app.musteri_id) return false;
        const prevDate = new Date(prevApp.tarih);
        return (prevDate.getMonth() !== thisMonth || prevDate.getFullYear() !== now.getFullYear()) 
          && prevDate < date;
      });
      
      if (!hadPreviousAppointments) {
        newCustomers.add(app.musteri_id);
      }
    }
  });
  
  const newCustomerPercentage = thisMonthCustomers.size > 0
    ? Math.round((newCustomers.size / thisMonthCustomers.size) * 100)
    : 0;
  
  const customerRatio = thisMonthCustomers.size > 0
    ? `Bu ay müşterilerin %${newCustomerPercentage}'ı ilk kez geldi.`
    : "Bu ay için yeterli müşteri verisi bulunmuyor.";

  return {
    mostProfitableService,
    mostPopularService,
    busiestDays,
    averageSpendingChange,
    customerRatio,
    hasEnoughData: true,
  };
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
