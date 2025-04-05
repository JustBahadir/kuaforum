
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { formatCurrency } from '@/lib/utils';
import { personelIslemleriServisi } from "@/lib/supabase";

interface PersonnelPerformanceReportsProps {
  personnelId: number;
}

export function PersonnelPerformanceReports({ personnelId }: PersonnelPerformanceReportsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [operationsByService, setOperationsByService] = useState<any[]>([]);
  const [operationsByCustomer, setOperationsByCustomer] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!personnelId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const operations = await personelIslemleriServisi.personelIslemleriGetirById(personnelId);
        
        if (operations && operations.length > 0) {
          // Group by month
          const monthlyData = groupByMonth(operations);
          setData(monthlyData);
          
          // Group by service type
          const serviceData = groupByServiceType(operations);
          setOperationsByService(serviceData);
          
          // Group by customer
          const customerData = groupByCustomer(operations);
          setOperationsByCustomer(customerData);
        } else {
          setData([]);
          setOperationsByService([]);
          setOperationsByCustomer([]);
        }
      } catch (err) {
        console.error("Error loading personnel performance data:", err);
        setError("Performans verileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [personnelId]);

  const groupByMonth = (operations: any[]) => {
    const months: Record<string, any> = {};
    
    operations.forEach((op) => {
      if (!op.created_at) return;
      
      const date = new Date(op.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = {
          month: getMonthName(date.getMonth()),
          year: date.getFullYear(),
          revenue: 0,
          operations: 0,
          puan: 0
        };
      }
      
      months[monthYear].revenue += Number(op.tutar) || 0;
      months[monthYear].puan += Number(op.puan) || 0;
      months[monthYear].operations += 1;
    });
    
    return Object.values(months);
  };

  const groupByServiceType = (operations: any[]) => {
    const services: Record<string, any> = {};
    
    operations.forEach((op) => {
      const serviceName = op.islem?.islem_adi || op.aciklama || 'Bilinmeyen';
      
      if (!services[serviceName]) {
        services[serviceName] = {
          id: serviceName,
          label: serviceName,
          value: 0,
          count: 0
        };
      }
      
      services[serviceName].value += Number(op.tutar) || 0;
      services[serviceName].count += 1;
    });
    
    return Object.values(services).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
  };

  const groupByCustomer = (operations: any[]) => {
    const customers: Record<string, any> = {};
    
    operations.forEach((op) => {
      // Check if musteri_id and musteri exists
      if (!op.musteri_id || !op.musteri) return;
      
      const customerId = op.musteri_id.toString();
      const customerName = op.musteri ? `${op.musteri.first_name} ${op.musteri.last_name || ''}` : `Müşteri ${customerId}`;
      
      if (!customers[customerId]) {
        customers[customerId] = {
          id: customerName,
          label: customerName,
          value: 0,
          count: 0
        };
      }
      
      customers[customerId].value += Number(op.tutar) || 0;
      customers[customerId].count += 1;
    });
    
    return Object.values(customers).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[monthIndex];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500">Bu personel için performans verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aylık Performans</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={data}
            keys={['revenue', 'puan']}
            indexBy="month"
            margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'nivo' }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Gelir (₺)',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20
              }
            ]}
            animate={true}
            valueFormat={(value) => String(value).includes('.') ? formatCurrency(value) : String(value)}
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>En Çok Yapılan İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsivePie
              data={operationsByService}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'nivo' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle'
                }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Müşteri Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {operationsByCustomer.length > 0 ? (
              <ResponsivePie
                data={operationsByCustomer}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: 'category10' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle'
                  }
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Müşteri verileri bulunamadı</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
