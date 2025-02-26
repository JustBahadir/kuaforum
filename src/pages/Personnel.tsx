
import { useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { PersonelIslemi, islemServisi, personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PersonnelList } from "./Personnel/components/PersonnelList";
import { PerformanceCharts } from "./Personnel/components/PerformanceCharts";

export default function Personnel() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  const { data: islemler = [] } = useQuery({
    queryKey: ['islemler'],
    queryFn: islemServisi.hepsiniGetir
  });

  const { data: personeller = [] } = useQuery({
    queryKey: ['personel'],
    queryFn: () => personelServisi.hepsiniGetir()
  });

  const { data: islemGecmisi = [] }: UseQueryResult<PersonelIslemi[], Error> = useQuery({
    queryKey: ['personelIslemleri'],
    queryFn: async () => {
      const data = await personelIslemleriServisi.hepsiniGetir();
      return data;
    }
  });

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="personel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personel">Personel Yönetimi</TabsTrigger>
          <TabsTrigger value="islemler">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="raporlar">Performans Raporları</TabsTrigger>
        </TabsList>

        <TabsContent value="personel">
          <PersonnelList />
        </TabsContent>

        <TabsContent value="islemler">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
              <div className="flex gap-4">
                <DateRangePicker 
                  from={dateRange.from}
                  to={dateRange.to}
                  onSelect={({from, to}) => setDateRange({from, to})}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {islemGecmisi.map((islem) => (
                      <tr key={islem.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(islem.created_at!).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {personeller?.find(p => p.id === islem.personel_id)?.ad_soyad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.aciklama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.tutar} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          %{islem.prim_yuzdesi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.odenen} TL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {islem.puan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raporlar">
          <PerformanceCharts 
            personeller={personeller} 
            islemGecmisi={islemGecmisi}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
