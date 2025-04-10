
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceDataItem {
  name: string;
  count: number;
  revenue: number;
}

interface ServicePerformanceChartProps {
  data: ServiceDataItem[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export function ServicePerformanceChart({ data, isLoading }: ServicePerformanceChartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    if (name === 'revenue') {
      return [formatCurrency(value), 'Gelir'];
    }
    return [value, 'İşlem Sayısı'];
  };
  
  // Custom label formatter
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Handle horizontal scrolling
  const scrollLeft = () => {
    const element = document.getElementById('service-bar-chart-container');
    if (element) {
      element.scrollLeft -= 200;
      setScrollPosition(element.scrollLeft);
    }
  };
  
  const scrollRight = () => {
    const element = document.getElementById('service-bar-chart-container');
    if (element) {
      element.scrollLeft += 200;
      setScrollPosition(element.scrollLeft);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hizmet Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Process data for the pie chart
  const revenueData = data.map(item => ({
    name: item.name,
    value: item.revenue
  }));
  
  const countData = data.map(item => ({
    name: item.name,
    value: item.count
  }));
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Hizmet Dağılımı</CardTitle>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? 
                <ChevronUp className="h-4 w-4 mr-1" /> :
                <ChevronDown className="h-4 w-4 mr-1" />
              }
              {isOpen ? "Küçült" : "Detaylar"}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <p className="text-center text-sm font-medium mb-2">Gelir Dağılımı</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-revenue-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return formatCurrency(value);
                    }
                    return value;
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-[300px]">
            <p className="text-center text-sm font-medium mb-2">İşlem Sayısı Dağılımı</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {countData.map((entry, index) => (
                    <Cell key={`cell-count-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <Collapsible open={isOpen}>
          <CollapsibleContent>
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-md mb-3">Hizmetlere Göre Detaylı Analiz</h3>
              
              <div className="relative">
                <div className="flex justify-between mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={scrollLeft}
                    className="z-10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={scrollRight}
                    className="z-10"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea 
                  className="h-[400px] w-full"
                  id="service-bar-chart-container"
                  onScroll={(e) => setScrollPosition((e.target as HTMLDivElement).scrollLeft)}
                >
                  <div className="min-w-[800px]">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={data}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'revenue') {
                              return [formatCurrency(value as number), 'Gelir'];
                            }
                            return [value, 'İşlem Sayısı'];
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="İşlem Sayısı" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="revenue" name="Gelir" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollArea>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-md mb-3">Hizmet Listesi</h4>
                <div className="relative rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hizmet</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem Sayısı</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Gelir</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ortalama</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((service, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{service.count}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(service.revenue)}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(service.revenue / service.count)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
