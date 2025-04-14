
import React, { useState, useEffect } from "react";
import { personelIslemleriServisi } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PerformanceTabProps {
  personnel: any;
}

export function PerformanceTab({ personnel }: PerformanceTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [analysisText, setAnalysisText] = useState<string>("");
  
  useEffect(() => {
    if (!personnel?.id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
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
          
          // Convert to array and sort by count
          const serviceArray = Object.values(serviceGroups).sort((a: any, b: any) => b.count - a.count);
          setPerformanceData(serviceArray);
          
          // Generate analysis text
          generateAnalysis(operations, serviceArray);
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [personnel]);
  
  const generateAnalysis = (operations: any[], serviceGroups: any[]) => {
    if (operations.length === 0 || serviceGroups.length === 0) {
      setAnalysisText("Bu personel için yeterli veri bulunmamaktadır.");
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
      `${personnel.ad_soyad} son 30 günde toplam ${totalOperations} işlem gerçekleştirdi ve ₺${totalRevenue.toLocaleString('tr-TR')} ciro oluşturdu.`,
      `En çok yapılan işlem "${mostFrequentService}" olarak görülüyor.`,
      `Performans grafiğine göre personelin en güçlü olduğu alan ${serviceGroups[0]?.name || "belirlenmemiş"}.`
    ];
    
    setAnalysisText(analysis.join(" "));
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      ) : performanceData.length > 0 ? (
        <>
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Akıllı Analiz</h3>
            <p className="text-sm">{analysisText}</p>
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
                  <Bar dataKey="commission" name="Prim" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Kategori Bazlı Değerlendirme</h3>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">HİZMET</th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">İŞLEM</th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">CİRO</th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">PRİM</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((service, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 text-sm">{service.name}</td>
                    <td className="p-2 text-sm text-right">{service.count}</td>
                    <td className="p-2 text-sm text-right">{formatCurrency(service.revenue)}</td>
                    <td className="p-2 text-sm text-right">{formatCurrency(service.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu personel için performans verisi bulunamadı.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
