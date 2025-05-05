
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonelIslemi } from "@/lib/supabase/types";
import { formatCurrency } from "@/utils/currencyFormatter";

interface PersonnelDetailsAnalystProps {
  personelId: string | number;
  personelAd: string;
  operations: PersonelIslemi[];
  startDate: Date;
  endDate: Date;
}

export function PersonnelDetailsAnalyst({
  personelId,
  personelAd,
  operations,
  startDate,
  endDate
}: PersonnelDetailsAnalystProps) {
  // Calculate financial stats
  const totalOperations = operations.length;
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalProfit = operations.reduce((sum, op) => {
    const primOrani = op.prim_yuzdesi || 0;
    return sum + ((op.tutar || 0) * primOrani / 100);
  }, 0);

  // Calculate top services
  const serviceData: Record<string, { count: number, revenue: number }> = {};
  
  operations.forEach(op => {
    const serviceKey = op.aciklama || 'Diğer';
    
    if (!serviceData[serviceKey]) {
      serviceData[serviceKey] = { count: 0, revenue: 0 };
    }
    
    serviceData[serviceKey].count += 1;
    serviceData[serviceKey].revenue += op.tutar || 0;
  });
  
  const topServices = Object.entries(serviceData)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">Dönem Toplam Gelir</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Prim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-gray-500 mt-1">Dönem Toplam Prim</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="topServices">
        <TabsList>
          <TabsTrigger value="topServices">En Çok Yapılan İşlemler</TabsTrigger>
          <TabsTrigger value="profitability">Karlılık Analizi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="topServices" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="font-medium">En Çok Yapılan 5 İşlem</h3>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.count} işlem</div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(service.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Bu dönemde işlem bulunmamaktadır.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="profitability" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <h3 className="font-medium">Karlılık Oranları</h3>
            {operations.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm font-medium text-gray-500">Ortalama İşlem Geliri</div>
                      <div className="text-2xl font-bold">{formatCurrency(totalRevenue / totalOperations)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm font-medium text-gray-500">Ortalama İşlem Primi</div>
                      <div className="text-2xl font-bold">{formatCurrency(totalProfit / totalOperations)}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500">Prim Oranı</div>
                  <div className="text-2xl font-bold">
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Bu dönemde işlem bulunmamaktadır.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
