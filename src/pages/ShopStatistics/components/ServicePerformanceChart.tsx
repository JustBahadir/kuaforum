
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell, TooltipProps, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServicePerformanceChartProps {
  data: any[];
  isLoading: boolean;
}

interface ServiceData {
  name: string;
  count: number;
  revenue: number;
}

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ServicePerformanceChart({ data, isLoading }: ServicePerformanceChartProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(3);
  const [startIndex, setStartIndex] = useState(0);
  const colors = ["#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#ef4444", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];
  
  // Check if there are enough items to enable pagination
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + itemsToShow < data.length;

  const visibleData = data.slice(startIndex, startIndex + itemsToShow);
  
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ServiceData;
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm">
            İşlem Sayısı: {data.count}
          </p>
          <p className="text-sm font-semibold">
            Toplam Ciro: {formatCurrency(data.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  const scrollLeft = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    setStartIndex(prev => Math.min(data.length - itemsToShow, prev + 1));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Hizmet Performansı</CardTitle>
          <CardDescription>En çok gelir getiren hizmetler</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
        >
          Tümünü Gör
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Henüz veri bulunmamaktadır</p>
          </div>
        ) : (
          <div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={visibleData} 
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" name="Gelir (₺)">
                    {visibleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="count" name="İşlem Sayısı" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
              
              {data.length > itemsToShow && (
                <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 pointer-events-none">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={`rounded-full bg-white shadow pointer-events-auto ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={`rounded-full bg-white shadow pointer-events-auto ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Dialog for showing all services */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tüm Hizmet Performansları</DialogTitle>
            <DialogDescription>
              Tüm hizmetler için performans ve gelir bilgileri
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-gray-50">Hizmet Adı</th>
                    <th className="text-right p-3 bg-gray-50">İşlem Sayısı</th>
                    <th className="text-right p-3 bg-gray-50">Toplam Ciro</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((service, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">{service.name}</td>
                      <td className="p-3 text-right">{service.count}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(service.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data.slice(0, 10)} 
                margin={{ left: 0, right: 30, top: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Gelir (₺)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="count" name="İşlem Sayısı" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
