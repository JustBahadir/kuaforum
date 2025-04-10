
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { useState, useEffect } from "react";

interface HourHeatmapProps {
  data: any[];
  isLoading: boolean;
}

export function HourHeatmapChart({ data, isLoading }: HourHeatmapProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    try {
      // Initialize hourly counts by day of week
      const hourlyData: Record<string, Record<string, number>> = {
        'Pazartesi': {},
        'Salı': {},
        'Çarşamba': {},
        'Perşembe': {},
        'Cuma': {},
        'Cumartesi': {},
        'Pazar': {}
      };
      
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      
      // Populate with actual data
      data.forEach(op => {
        if (!op.created_at) return;
        
        const date = new Date(op.created_at);
        const day = dayNames[date.getDay()];
        const hour = date.getHours();
        const hourKey = `${hour}:00`;
        
        if (!hourlyData[day][hourKey]) {
          hourlyData[day][hourKey] = 0;
        }
        
        hourlyData[day][hourKey]++;
      });
      
      // Convert to format needed for scatter plot heatmap
      const result: any[] = [];
      
      Object.entries(hourlyData).forEach(([day, hours], dayIndex) => {
        for (let h = 8; h <= 21; h++) {  // Business hours 8am to 9pm
          const hourKey = `${h}:00`;
          const count = hours[hourKey] || 0;
          
          result.push({
            x: dayIndex,
            y: h - 8, // Normalize to 0-13 range
            z: count,
            day,
            hour: hourKey
          });
        }
      });
      
      setChartData(result);
    } catch (error) {
      console.error("Error preparing hour heatmap data:", error);
    }
  }, [data]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Günlük Yoğunluk Haritası</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for the heatmap
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p>{`${data.day} ${data.hour}`}</p>
          <p>{`İşlem Sayısı: ${data.z}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Color scale for heatmap
  const getColor = (value: number) => {
    const maxValue = Math.max(...chartData.map(item => item.z));
    if (value === 0) return '#f3f4f6'; // Light gray for zero
    
    const intensity = value / maxValue;
    
    if (intensity < 0.25) return '#d1e8fc'; // Light blue
    if (intensity < 0.5) return '#93c5fd';  // Medium blue
    if (intensity < 0.75) return '#3b82f6'; // Darker blue
    return '#1d4ed8';                       // Darkest blue
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Günlük Yoğunluk Haritası</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Gün" 
              domain={[0, 6]} 
              tickCount={7}
              tickFormatter={(value) => ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][value]}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Saat"
              domain={[0, 13]}
              tickCount={14}
              tickFormatter={(value) => `${value + 8}:00`}
            />
            <ZAxis type="number" dataKey="z" range={[0, 400]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={chartData} shape="square">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.z)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
