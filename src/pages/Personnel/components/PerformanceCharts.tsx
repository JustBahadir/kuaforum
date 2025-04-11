
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Personel, PersonelIslemi, IslemKategori } from "@/lib/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { islemServisi } from "@/lib/supabase";

interface PerformanceChartsProps {
  personeller: Personel[];
  islemGecmisi: PersonelIslemi[];
}

export function PerformanceCharts({ personeller, islemGecmisi }: PerformanceChartsProps) {
  const [chartType, setChartType] = useState<'daily' | 'monthly'>('daily');
  
  // Kategori verilerini çekiyoruz
  const { data: kategoriler = [] } = useQuery({
    queryKey: ['islem-kategorileri'],
    queryFn: islemServisi.kategorileriGetir,
  });
  
  // Personel işlem verilerini performans grafiğine dönüştürüyoruz
  const personnelPerformanceData = personeller
    .map((personel) => {
      const personelIslemleri = islemGecmisi.filter(
        (islem) => islem.personel_id === personel.id
      );

      const islemSayisi = personelIslemleri.length;
      const toplamCiro = personelIslemleri.reduce(
        (sum, islem) => sum + (islem.tutar || 0),
        0
      );
      const toplamPuan = personelIslemleri.reduce(
        (sum, islem) => sum + (islem.puan || 0),
        0
      );

      return {
        name: personel.ad_soyad,
        islemSayisi,
        toplamCiro,
        toplamPuan,
        ortalamaCiro: islemSayisi ? toplamCiro / islemSayisi : 0,
        ortalamaPuan: islemSayisi ? toplamPuan / islemSayisi : 0,
      };
    })
    .sort((a, b) => b.toplamCiro - a.toplamCiro)
    .slice(0, 5); // En iyi 5 performans gösteren personeli alıyoruz

  // İşlemleri tarihe göre gruplayıp günlük/aylık verileri oluşturuyoruz
  const timeChartData = () => {
    const dateMap: Record<string, any> = {};

    islemGecmisi.forEach((islem) => {
      if (!islem.created_at) return;
      
      const date = new Date(islem.created_at);
      const key = chartType === 'daily' 
        ? date.toISOString().split('T')[0]  // YYYY-MM-DD
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM for monthly
      
      if (!dateMap[key]) {
        dateMap[key] = {
          date: key,
          displayDate: chartType === 'daily'
            ? new Date(key).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
            : new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          islemSayisi: 0,
          ciro: 0
        };
      }
      
      dateMap[key].islemSayisi += 1;
      dateMap[key].ciro += islem.tutar || 0;
    });
    
    return Object.values(dateMap)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
  };
  
  // Kategori bazlı işlem verilerini hazırlıyoruz
  const prepareKategoriData = () => {
    // Kategori ID'ye göre işlem sayısını ve ciroyu toplama
    const kategoriMap: Record<number, { 
      kategoriId: number,
      kategoriAdi: string,
      islemSayisi: number, 
      toplamCiro: number 
    }> = {};

    // Önce kategorileri oluştur
    kategoriler.forEach(kategori => {
      kategoriMap[kategori.id] = {
        kategoriId: kategori.id,
        kategoriAdi: kategori.kategori_adi,
        islemSayisi: 0,
        toplamCiro: 0
      };
    });

    // İşlemleri kategorilerine göre grupla
    islemGecmisi.forEach(islem => {
      if (islem.islem?.kategori_id && kategoriMap[islem.islem.kategori_id]) {
        kategoriMap[islem.islem.kategori_id].islemSayisi += 1;
        kategoriMap[islem.islem.kategori_id].toplamCiro += islem.tutar || 0;
      }
    });

    return Object.values(kategoriMap);
  };

  const kategoriIslemData = prepareKategoriData()
    .sort((a, b) => b.islemSayisi - a.islemSayisi)
    .slice(0, 5);

  const kategoriCiroData = prepareKategoriData()
    .sort((a, b) => b.toplamCiro - a.toplamCiro)
    .slice(0, 5);

  // Renk dizisi
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // İşlem sayısı ve ciro verilerini birleştirdiğimiz composedChart için veri
  const timeData = timeChartData();

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Personel Performans Karşılaştırması</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={personnelPerformanceData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => 
                    typeof value === 'number' 
                      ? value % 1 === 0 
                        ? value 
                        : formatCurrency(value) 
                      : value
                  } />
                  <Legend />
                  <Bar dataKey="islemSayisi" name="İşlem Sayısı" fill="#8884d8" />
                  <Bar dataKey="toplamCiro" name="Toplam Ciro (₺)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Zaman Bazlı Performans</CardTitle>
              <div>
                <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'daily' | 'monthly')}>
                  <TabsList>
                    <TabsTrigger value="daily">Günlük</TabsTrigger>
                    <TabsTrigger value="monthly">Aylık</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={timeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayDate" 
                    height={60}
                    tick={renderCustomAxisTick}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="islemSayisi" 
                    name="İşlem Sayısı" 
                    fill="#8884d8" 
                    barSize={20} 
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ciro"
                    name="Ciro (₺)"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>En Popüler Kategoriler</CardTitle>
            <p className="text-sm text-muted-foreground">İşlem sayısına göre en popüler kategoriler</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kategoriIslemData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="kategoriAdi" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      return [`${value} işlem`, 'İşlem Sayısı'];
                    }} 
                    labelFormatter={(label) => `${label}`} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="islemSayisi" 
                    name="İşlem Sayısı" 
                    fill="#8884d8" 
                    radius={[0, 4, 4, 0]}
                  >
                    {kategoriIslemData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>En Kazançlı Kategoriler</CardTitle>
            <p className="text-sm text-muted-foreground">Toplam ciroya göre en kazançlı kategoriler</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kategoriCiroData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="kategoriAdi" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Toplam Ciro']} 
                    labelFormatter={(label) => `${label}`} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="toplamCiro" 
                    name="Toplam Ciro" 
                    fill="#82ca9d"
                    radius={[0, 4, 4, 0]}
                  >
                    {kategoriCiroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
