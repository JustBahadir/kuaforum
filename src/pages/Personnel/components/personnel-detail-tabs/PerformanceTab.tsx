
import React, { useState, useEffect } from "react";
import { personelIslemleriServisi } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { YearlyStatisticsPlaceholder } from "@/pages/ShopStatistics/components/YearlyStatisticsPlaceholder";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

interface PerformanceTabProps {
  personnel: any;
}

export function PerformanceTab({ personnel }: PerformanceTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [analysisText, setAnalysisText] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!personnel?.id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const operations = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
        
        // Process operations to get performance data
        if (operations && operations.length > 0) {
          // Group by service type
          const serviceGroups = operations.reduce((acc: any, op: any) => {
            const serviceName = op.islem?.islem_adi || op.aciklama || 'Diğer';
            if (!acc[serviceName]) {
              acc[serviceName] = {
                name: serviceName,
                count: 0,
                revenue: 0,
                commission: 0
              };
            }
            acc[serviceName].count += 1;
            acc[serviceName].revenue += Number(op.tutar) || 0;
            acc[serviceName].commission += Number(op.odenen) || 0;
            return acc;
          }, {});
          
          // Convert to array and sort by revenue
          const serviceArray = Object.values(serviceGroups).sort((a: any, b: any) => b.revenue - a.revenue);
          setPerformanceData(serviceArray);
          
          // Group by category for the category chart
          const categoryGroups = operations.reduce((acc: any, op: any) => {
            const categoryId = op.islem?.kategori_id;
            const categoryName = categoryId ? `Kategori ${categoryId}` : 'Diğer';
            
            if (!acc[categoryName]) {
              acc[categoryName] = {
                name: categoryName,
                count: 0,
                revenue: 0
              };
            }
            
            acc[categoryName].count += 1;
            acc[categoryName].revenue += Number(op.tutar) || 0;
            return acc;
          }, {});
          
          // Convert to array and sort by revenue
          const categoryArray = Object.values(categoryGroups).sort((a: any, b: any) => b.revenue - a.revenue);
          setCategoryData(categoryArray);
          
          // Generate analysis text
          generateAnalysis(operations, serviceArray, categoryArray);
        } else {
          setPerformanceData([]);
          setCategoryData([]);
          setAnalysisText(["Bu personel için henüz işlem verisi bulunmamaktadır."]);
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setError("Personel performans verileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [personnel]);
  
  const generateAnalysis = (operations: any[], serviceGroups: any[], categoryGroups: any[]) => {
    if (operations.length === 0 || serviceGroups.length === 0) {
      setAnalysisText(["Bu personel için yeterli veri bulunmamaktadır."]);
      return;
    }
    
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    // Filter operations for the current month
    const currentMonthOperations = operations.filter(op => {
      const date = new Date(op.created_at);
      return date >= lastMonth && date <= today;
    });
    
    const totalRevenue = currentMonthOperations.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0);
    const totalOperations = currentMonthOperations.length;
    const mostFrequentService = serviceGroups[0]?.name || "işlem";
    
    // Generate analysis
    const analysis = [
      `${personnel.ad_soyad} son 30 günde toplam ${totalOperations} işlem gerçekleştirdi ve ${formatCurrency(totalRevenue)} ciro oluşturdu.`,
      `En çok yapılan işlem "${mostFrequentService}" olarak görülüyor.`,
      `Bu personelin işlem başına ortalama geliri: ${formatCurrency(totalRevenue / (totalOperations || 1))}.`
    ];
    
    // Add category analysis if available
    if (categoryGroups.length > 0) {
      const topCategory = categoryGroups[0];
      analysis.push(`En çok performans gösterdiği kategori: ${topCategory.name} (${formatCurrency(topCategory.revenue)}).`);
    }
    
    // Add performance tip
    if (personnel.calisma_sistemi === "prim_komisyon") {
      const commissionTotal = currentMonthOperations.reduce((sum, op) => sum + (Number(op.odenen) || 0), 0);
      const commissionRatio = (commissionTotal / totalRevenue) * 100 || 0;
      analysis.push(`Toplam prim kazancı: ${formatCurrency(commissionTotal)} (Cironun %${commissionRatio.toFixed(1)}'i)`);
    }
    
    setAnalysisText(analysis);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (performanceData.length === 0) {
    return <YearlyStatisticsPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Akıllı Analiz</h3>
        <ul className="space-y-1">
          {analysisText.map((text, index) => (
            <li key={index} className="flex items-baseline gap-2">
              <span className="text-purple-600 text-lg">•</span>
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Hizmet Performansı</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData.slice(0, 5)} // Show top 5 services
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "revenue" || name === "commission") {
                    return [formatCurrency(value as number), name === "revenue" ? "Ciro" : "Prim"];
                  }
                  return [value, name === "count" ? "İşlem Sayısı" : name];
                }}
              />
              <Legend />
              <Bar dataKey="count" name="İşlem Sayısı" fill="#8884d8" />
              <Bar dataKey="revenue" name="Ciro" fill="#82ca9d" />
              {personnel.calisma_sistemi === "prim_komisyon" && (
                <Bar dataKey="commission" name="Prim" fill="#ffc658" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Hizmet Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {performanceData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Kategori Bazlı Değerlendirme</h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Kategori verisi bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Hizmet Detayları</h3>
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 text-xs font-medium text-muted-foreground">HİZMET</th>
              <th className="text-right p-2 text-xs font-medium text-muted-foreground">İŞLEM</th>
              <th className="text-right p-2 text-xs font-medium text-muted-foreground">CİRO</th>
              {personnel.calisma_sistemi === "prim_komisyon" && (
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">PRİM</th>
              )}
            </tr>
          </thead>
          <tbody>
            {performanceData.map((service, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 text-sm">{service.name}</td>
                <td className="p-2 text-sm text-right">{service.count}</td>
                <td className="p-2 text-sm text-right">{formatCurrency(service.revenue)}</td>
                {personnel.calisma_sistemi === "prim_komisyon" && (
                  <td className="p-2 text-sm text-right">{formatCurrency(service.commission)}</td>
                )}
              </tr>
            ))}
            {performanceData.length > 0 && (
              <tr className="border-t font-medium">
                <td className="p-2 text-sm">Toplam</td>
                <td className="p-2 text-sm text-right">
                  {performanceData.reduce((sum, item) => sum + item.count, 0)}
                </td>
                <td className="p-2 text-sm text-right">
                  {formatCurrency(performanceData.reduce((sum, item) => sum + item.revenue, 0))}
                </td>
                {personnel.calisma_sistemi === "prim_komisyon" && (
                  <td className="p-2 text-sm text-right">
                    {formatCurrency(performanceData.reduce((sum, item) => sum + item.commission, 0))}
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
