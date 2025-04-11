
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

export function PersonnelPerformanceReports({ personnelId: propPersonnelId }: { personnelId?: number }) {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  
  const { data: personeller = [], isLoading: loadingPersonnel } = useQuery({
    queryKey: ['personel-list'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  // Use provided ID or select the first one from the list
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(propPersonnelId || null);
  
  // Set first personnel as default when list loads
  useEffect(() => {
    if (personeller.length > 0 && !selectedPersonnelId) {
      setSelectedPersonnelId(personeller[0]?.id || null);
    }
  }, [personeller, selectedPersonnelId]);

  // Use the passed ID if it exists, otherwise use the selected one
  const activePersonnelId = propPersonnelId || selectedPersonnelId;

  const { data: personel } = useQuery({
    queryKey: ['personel-detail', activePersonnelId],
    queryFn: () => activePersonnelId ? personelServisi.getirById(activePersonnelId) : null,
    enabled: !!activePersonnelId
  });
  
  const { data: islemler = [] } = useQuery({
    queryKey: ['personel-islemleri', activePersonnelId, dateRange],
    queryFn: async () => {
      if (!activePersonnelId) return [];
      const butunIslemler = await personelIslemleriServisi.personelIslemleriGetir(activePersonnelId);
      return butunIslemler.filter(islem => {
        if (!islem.created_at) return true;
        const islemDate = new Date(islem.created_at);
        return islemDate >= dateRange.from && islemDate <= dateRange.to;
      });
    },
    enabled: !!activePersonnelId
  });
  
  // Calculate performance metrics
  const totalRevenue = islemler.reduce((sum, islem) => sum + (islem.tutar || 0), 0);
  const totalCommission = islemler.reduce((sum, islem) => sum + (islem.odenen || 0), 0);
  const operationsCount = islemler.length;
  const totalPoints = islemler.reduce((sum, islem) => sum + (islem.puan || 0), 0);
  
  // Calculate daily metrics (for daily wage workers)
  const uniqueDays = new Set(islemler.map(islem => 
    islem.created_at ? format(new Date(islem.created_at), 'yyyy-MM-dd') : null
  ).filter(Boolean));
  const workingDaysCount = uniqueDays.size;
  
  // Calculate earnings based on working system
  let calculatedEarnings = 0;
  if (personel) {
    switch (personel.calisma_sistemi) {
      case 'aylik_maas':
        calculatedEarnings = personel.maas || 0;
        break;
      case 'gunluk_yevmiye':
        calculatedEarnings = (personel.gunluk_ucret || 0) * workingDaysCount;
        break;
      case 'haftalik_yevmiye':
        const weeksCount = Math.ceil(workingDaysCount / 7);
        calculatedEarnings = (personel.haftalik_ucret || 0) * weeksCount;
        break;
      case 'prim_komisyon':
        calculatedEarnings = totalCommission;
        break;
      default:
        calculatedEarnings = 0;
    }
  }
  
  // Group operations by date for charts
  const operationsByDate = islemler.reduce((acc: Record<string, any>, islem) => {
    if (!islem.created_at) return acc;
    
    const dateStr = format(new Date(islem.created_at), 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        revenue: 0,
        commission: 0,
        operations: 0,
        points: 0
      };
    }
    
    acc[dateStr].revenue += islem.tutar || 0;
    acc[dateStr].commission += islem.odenen || 0;
    acc[dateStr].operations += 1;
    acc[dateStr].points += islem.puan || 0;
    
    return acc;
  }, {});
  
  const timeSeriesData = Object.values(operationsByDate).map((item: any) => ({
    ...item,
    date: format(new Date(item.date), 'd MMM', { locale: tr }),
    // Ensure operations are whole numbers
    operations: Math.round(item.operations)
  }));
  
  // Group operations by type for pie chart
  const operationsByType = islemler.reduce((acc: Record<string, any>, islem) => {
    const islemAdi = islem.islem?.islem_adi || islem.aciklama || 'Diğer';
    
    if (!acc[islemAdi]) {
      acc[islemAdi] = {
        name: islemAdi,
        value: 0,
        count: 0
      };
    }
    
    acc[islemAdi].value += islem.tutar || 0;
    acc[islemAdi].count += 1;
    
    return acc;
  }, {});
  
  const pieChartData = Object.values(operationsByType);
  
  // Colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  
  // Custom render function for XAxis tick to create angled text
  const renderCustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="end" 
          fill="#666"
          transform="rotate(-45)"
          style={{ fontSize: '12px' }}
        >
          {payload.value}
        </text>
      </g>
    );
  };
  
  if (loadingPersonnel) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Tabs defaultValue={selectedPersonnelId?.toString() || personeller[0]?.id.toString()} className="w-full" onValueChange={(value) => setSelectedPersonnelId(Number(value))}>
          <TabsList className="w-full h-auto flex-wrap justify-start border-b pb-0 mb-6">
            {personeller.map(person => (
              <TabsTrigger 
                key={person.id} 
                value={person.id.toString()}
                className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {person.ad_soyad}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {personeller.map(person => (
            <TabsContent key={person.id} value={person.id.toString()} className="mt-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{person.ad_soyad}</h2>
                  <p className="text-gray-500">
                    {person.calisma_sistemi === 'aylik_maas' && 'Sabit Aylık Maaşlı'}
                    {person.calisma_sistemi === 'gunluk_yevmiye' && 'Günlük Yevmiyeli'}
                    {person.calisma_sistemi === 'haftalik_yevmiye' && 'Haftalık Yevmiyeli'}
                    {person.calisma_sistemi === 'prim_komisyon' && 'Prim / Komisyon Bazlı'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <DateRangePicker
                    from={dateRange.from}
                    to={dateRange.to}
                    onSelect={({from, to}) => setDateRange({from: from || dateRange.from, to: to || dateRange.to})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">İşlem Sayısı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{operationsCount}</div>
                    <p className="text-xs text-gray-500">
                      Seçili tarih aralığındaki toplam işlem adedi
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Toplam Puan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalPoints}</div>
                    <p className="text-xs text-gray-500">
                      Yapılan işlemlerin puan toplamı
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Toplam Ciro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-gray-500">
                      Gerçekleştirilen işlemlerin toplam tutarı
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {person.calisma_sistemi === 'prim_komisyon' 
                        ? 'Komisyon Geliri' 
                        : person.calisma_sistemi === 'gunluk_yevmiye'
                        ? 'Günlük Yevmiye Toplamı'
                        : person.calisma_sistemi === 'haftalik_yevmiye'
                        ? 'Haftalık Ücret Toplamı'
                        : 'Aylık Maaş'
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(calculatedEarnings)}</div>
                    <p className="text-xs text-gray-500">
                      {person.calisma_sistemi === 'prim_komisyon' 
                        ? 'İşlemlerden elde edilen komisyon tutarı' 
                        : person.calisma_sistemi === 'gunluk_yevmiye'
                        ? `${workingDaysCount} gün × ${formatCurrency(person.gunluk_ucret || 0)}`
                        : person.calisma_sistemi === 'haftalik_yevmiye'
                        ? `${Math.ceil(workingDaysCount / 7)} hafta × ${formatCurrency(person.haftalik_ucret || 0)}`
                        : 'Sabit aylık maaş tutarı'
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Ciro Analizi</TabsTrigger>
          <TabsTrigger value="operations">İşlem Analizi</TabsTrigger>
          <TabsTrigger value="services">Hizmet Dağılımı</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Günlük Ciro ve Kazanç</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={timeSeriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      height={60}
                      tick={renderCustomAxisTick}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `₺${value}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.2))]}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue') return [formatCurrency(value as number), 'Ciro'];
                        if (name === 'commission') return [formatCurrency(value as number), 'Kazanç'];
                        if (name === 'operations') return [Math.round(Number(value)), 'İşlem Sayısı'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="revenue" 
                      name="Ciro" 
                      fill="#8884d8" 
                      barSize={30}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="operations" 
                      name="İşlem Sayısı" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Günlük İşlem ve Puan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={timeSeriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      height={60}
                      tick={renderCustomAxisTick}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      allowDecimals={false}
                      domain={[0, 'dataMax + 1']}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.2))]}
                    />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'operations') {
                        return [Math.round(Number(value)), 'İşlem Sayısı'];
                      }
                      return [value, name === 'points' ? 'Puan' : name];
                    }} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="operations" 
                      name="İşlem Sayısı" 
                      fill="#8884d8" 
                      barSize={30}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="points" 
                      name="Puan" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex flex-col md:flex-row items-center justify-center">
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={30}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name }) => {
                          const shortName = name.length > 12 ? 
                            name.substring(0, 12) + '...' : 
                            name;
                          return shortName;
                        }}
                      >
                        {pieChartData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value as number)} 
                        contentStyle={{
                          borderRadius: "4px",
                          padding: "10px",
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2">
                  <h4 className="font-medium mb-2 text-center md:text-left">Yapılan İşlemler</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {pieChartData
                      .sort((a: any, b: any) => b.count - a.count)
                      .slice(0, 7)
                      .map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                              style={{backgroundColor: COLORS[index % COLORS.length]}}
                            />
                            <span className="truncate max-w-48" title={item.name}>{item.name}</span>
                          </div>
                          <div className="text-sm font-medium">{Math.round(item.count)} işlem</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
