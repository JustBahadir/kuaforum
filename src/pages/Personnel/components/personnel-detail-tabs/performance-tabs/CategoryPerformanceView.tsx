
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { InfoIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryPerformanceData } from "@/utils/performanceUtils";

interface CategoryPerformanceViewProps {
  categoryData: CategoryPerformanceData[];
  insights: string[];
  refreshAnalysis: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

export function CategoryPerformanceView({ categoryData, insights, refreshAnalysis }: CategoryPerformanceViewProps) {
  if (categoryData.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Bu tarih aralığında veri bulunamadı. Lütfen farklı bir tarih aralığı seçin.
        </AlertDescription>
      </Alert>
    );
  }

  // Format data for the bar chart (top 7 categories by revenue)
  const barChartData = categoryData
    .slice(0, 7)
    .map(item => ({
      name: item.name,
      revenue: item.revenue,
      count: item.count
    }));

  // Format data for the pie chart
  const pieChartData = categoryData.map(item => ({
    name: item.name,
    value: item.revenue
  }));

  return (
    <div className="space-y-6">
      {/* Smart Insights */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Akıllı Analiz</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshAnalysis}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary text-lg">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Kategori Bazlı Performans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-x-auto">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'revenue') return [formatCurrency(value as number), 'Ciro'];
                        return [value, 'İşlem Sayısı'];
                      }}
                    />
                    <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Ciro" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="count" name="İşlem Sayısı" stroke="#ff0000" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart for Category Distribution */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Kategori Dağılımı</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Kategori bazında ciro dağılımı. En büyük dilimler en çok gelir getiren kategorileri gösterir.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => [formatCurrency(value as number), 'Ciro']} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Table of Category Details */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Kategori</th>
                    <th className="py-2 px-2 text-right">İşlem Sayısı</th>
                    <th className="py-2 px-2 text-right">Ciro</th>
                    <th className="py-2 px-2 text-right">Oran</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((category, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="py-2 px-2">{category.name}</td>
                      <td className="py-2 px-2 text-right">{category.count}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(category.revenue)}</td>
                      <td className="py-2 px-2 text-right">%{category.percentage?.toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-medium">
                    <td className="py-2 px-2">Toplam</td>
                    <td className="py-2 px-2 text-right">{categoryData.reduce((sum, item) => sum + item.count, 0)}</td>
                    <td className="py-2 px-2 text-right">{formatCurrency(categoryData.reduce((sum, item) => sum + item.revenue, 0))}</td>
                    <td className="py-2 px-2 text-right">%100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
