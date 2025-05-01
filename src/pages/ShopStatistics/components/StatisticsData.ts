
import { addDays, format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Generates sample statistics data for development purposes
 */
export const generateSampleStatisticsData = (fromDate: Date, toDate: Date) => {
  // Calculate date range
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate metrics data
  const metrics = {
    daily: {
      totalRevenue: Math.floor(Math.random() * 2000) + 1000,
      totalAppointments: Math.floor(Math.random() * 30) + 10,
      averageTicket: Math.floor(Math.random() * 200) + 100,
      customerCount: Math.floor(Math.random() * 25) + 5,
      completionRate: Math.floor(Math.random() * 30) + 70
    },
    weekly: {
      totalRevenue: Math.floor(Math.random() * 10000) + 5000,
      totalAppointments: Math.floor(Math.random() * 100) + 50,
      averageTicket: Math.floor(Math.random() * 200) + 100,
      customerCount: Math.floor(Math.random() * 80) + 20,
      completionRate: Math.floor(Math.random() * 20) + 80
    },
    monthly: {
      totalRevenue: Math.floor(Math.random() * 40000) + 20000,
      totalAppointments: Math.floor(Math.random() * 400) + 200,
      averageTicket: Math.floor(Math.random() * 200) + 100,
      customerCount: Math.floor(Math.random() * 200) + 100,
      completionRate: Math.floor(Math.random() * 15) + 85
    },
    yearly: {
      totalRevenue: Math.floor(Math.random() * 500000) + 200000,
      totalAppointments: Math.floor(Math.random() * 5000) + 2000,
      averageTicket: Math.floor(Math.random() * 200) + 100,
      customerCount: Math.floor(Math.random() * 1000) + 500,
      completionRate: Math.floor(Math.random() * 10) + 90
    }
  };
  
  // Generate hourly data for charts
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i; // 8 AM to 8 PM
    return {
      hour: `${hour}:00`,
      appointments: Math.floor(Math.random() * 8) + 1,
      revenue: (Math.floor(Math.random() * 8) + 1) * 150
    };
  });
  
  // Generate service performance data
  const serviceNames = [
    'Saç Kesimi', 'Saç Boyama', 'Sakal Tıraşı', 'Fön', 
    'Manikür', 'Pedikür', 'Yüz Bakımı', 'Ağda'
  ];
  
  const serviceData = serviceNames.map(name => ({
    name,
    count: Math.floor(Math.random() * 50) + 10,
    revenue: (Math.floor(Math.random() * 50) + 10) * 100
  }));
  
  // Generate monthly trends data
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(fromDate);
    date.setMonth(date.getMonth() - 6 + i);
    
    return {
      month: format(date, 'MMM', { locale: tr }),
      revenue: Math.floor(Math.random() * 30000) + 5000,
      appointments: Math.floor(Math.random() * 300) + 50,
      customers: Math.floor(Math.random() * 200) + 30
    };
  });
  
  // Generate customer frequency data
  const customerFrequency = [
    { frequency: '1 kez', count: Math.floor(Math.random() * 100) + 20 },
    { frequency: '2-3 kez', count: Math.floor(Math.random() * 80) + 15 },
    { frequency: '4-6 kez', count: Math.floor(Math.random() * 50) + 10 },
    { frequency: '7-12 kez', count: Math.floor(Math.random() * 30) + 5 },
    { frequency: '12+ kez', count: Math.floor(Math.random() * 15) + 2 }
  ];
  
  // Generate category distribution data
  const categories = ['Saç', 'Sakal', 'Tırnak', 'Cilt Bakımı', 'Diğer'];
  const categoryDistribution = categories.map(name => ({
    name,
    value: Math.floor(Math.random() * 5000) + 1000,
    count: Math.floor(Math.random() * 50) + 10
  }));
  
  // Generate operations distribution data
  const operationsDistribution = Array.from({ length: days < 30 ? days : 30 }, (_, i) => {
    const date = addDays(fromDate, i);
    return {
      date: format(date, 'dd MMM', { locale: tr }),
      operations: Math.floor(Math.random() * 15) + 1,
      revenue: (Math.floor(Math.random() * 15) + 1) * 200
    };
  });
  
  // Generate customer loyalty data
  const customerLoyalty = Array.from({ length: Math.min(days, 60) }, (_, i) => {
    const date = subDays(toDate, i);
    return {
      date: format(date, 'dd MMM', { locale: tr }),
      newCustomers: Math.floor(Math.random() * 5) + 1,
      returningCustomers: Math.floor(Math.random() * 8) + 2
    };
  }).reverse();
  
  return {
    metrics,
    hourlyData,
    serviceData,
    monthlyTrends,
    customerFrequency,
    categoryDistribution,
    operationsDistribution,
    customerLoyalty
  };
};
