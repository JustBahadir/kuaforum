
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { PersonnelAnalyst } from "@/components/analyst/PersonnelAnalyst";

interface PersonelIslemi {
  id: number;
  personel_id: number;
  islem_id?: number;
  musteri_id?: number;
  aciklama: string;
  tutar: number;
  created_at: string;
  prim_yuzdesi?: number;
  odenen?: number;
  islem?: any;
  musteri?: any;
  personel?: any;
}

interface PersonnelStatistics {
  id: number;
  name: string;
  operations: number;
  revenue: number;
  prim: number;
}

interface SortOption {
  value: keyof PersonnelStatistics;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'revenue', label: 'Ciroya Göre' },
  { value: 'operations', label: 'İşlem Sayısına Göre' },
  { value: 'prim', label: 'Prim Kazancına Göre' }
];

interface PerformanceChartsProps {
  personeller: any[];
  islemGecmisi: PersonelIslemi[];
}

export function PerformanceCharts({ 
  personeller, 
  islemGecmisi 
}: PerformanceChartsProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [sortBy, setSortBy] = useState<keyof PersonnelStatistics>('revenue');
  const [chartData, setChartData] = useState<PersonnelStatistics[]>([]);
  const [monthCycleDay, setMonthCycleDay] = useState(1);
  const [useMonthCycle, setUseMonthCycle] = useState(false);
  
  const handleDateRangeChange = ({from, to}: {from: Date, to: Date}) => {
    setDateRange({from, to});
    setUseMonthCycle(false);
  };

  const handleMonthCycleChange = (day: number, date: Date) => {
    setMonthCycleDay(day);
    
    const currentDate = new Date();
    const selectedDay = day;
    
    let fromDate = new Date();
    
    // Set to previous month's cycle day
    fromDate.setDate(selectedDay);
    if (currentDate.getDate() < selectedDay) {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }
    
    // Create the end date (same day, current month)
    const toDate = new Date(fromDate);
    toDate.setMonth(toDate.getMonth() + 1);
    
    setDateRange({
      from: fromDate,
      to: toDate
    });
    
    setUseMonthCycle(true);
  };
  
  useEffect(() => {
    if (!personeller.length || !islemGecmisi.length) {
      setChartData([]);
      return;
    }
    
    const filteredOps = islemGecmisi.filter(islem => {
      if (!islem.created_at) return false;
      const date = new Date(islem.created_at);
      return date >= dateRange.from && date <= dateRange.to;
    });
    
    if (!filteredOps.length) {
      setChartData([]);
      return;
    }
    
    const statistics: Record<number, PersonnelStatistics> = {};
    
    personeller.forEach(personnel => {
      statistics[personnel.id] = {
        id: personnel.id,
        name: personnel.ad_soyad,
        operations: 0,
        revenue: 0,
        prim: 0
      };
    });
    
    filteredOps.forEach(op => {
      const personelId = op.personel_id;
      
      if (statistics[personelId]) {
        statistics[personelId].operations += 1;
        statistics[personelId].revenue += Number(op.tutar) || 0;
        statistics[personelId].prim += Number(op.odenen) || 0;
      }
    });
    
    const statsArray = Object.values(statistics)
      .filter(stat => stat.operations > 0)
      .sort((a, b) => b[sortBy] - a[sortBy]);
    
    setChartData(statsArray);
  }, [personeller, islemGecmisi, dateRange, sortBy]);
  
  const formatTooltip = (value: any, name: any) => {
    if (name === 'revenue') {
      return [`${formatCurrency(value)}`, 'Ciro'];
    } else if (name === 'prim') {
      return [`${formatCurrency(value)}`, 'Prim'];
    }
    return [value, 'İşlem Sayısı'];
  };
  
  const getChartHeight = () => {
    const minHeight = 300;
    const perPersonHeight = 60;
    return Math.max(minHeight, chartData.length * perPersonHeight);
  };
  
  const noData = chartData.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Select 
          value={sortBy} 
          onValueChange={(value) => setSortBy(value as keyof PersonnelStatistics)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          {!useMonthCycle && (
            <DateRangePicker 
              from={dateRange.from}
              to={dateRange.to}
              onSelect={handleDateRangeChange}
            />
          )}
          
          <CustomMonthCycleSelector 
            selectedDay={monthCycleDay}
            onChange={handleMonthCycleChange}
            active={useMonthCycle}
            onClear={() => setUseMonthCycle(false)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Personel Performans Karşılaştırması</CardTitle>
        </CardHeader>
        <CardContent>
          {noData ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seçilen tarih aralığında personel performans verisi bulunamadı.
              </AlertDescription>
            </Alert>
          ) : (
            <div style={{ height: getChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 60 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }} 
                    width={120}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Bar dataKey="revenue" name="Ciro" fill="#8884d8" />
                  <Bar dataKey="operations" name="İşlem Sayısı" fill="#82ca9d" />
                  <Bar dataKey="prim" name="Prim" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
