
import { useState } from "react";
import { StaffLayout } from "@/components/ui/staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { formatCurrency } from "@/lib/utils";

export default function OperationsHistory() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const { data: operationsData = [], isLoading } = useQuery({
    queryKey: ['personelIslemleri', dateRange.from, dateRange.to],
    queryFn: async () => {
      const data = await personelIslemleriServisi.hepsiniGetir();
      return data.filter(islem => {
        if (!islem.created_at) return true;
        const islemDate = new Date(islem.created_at);
        return islemDate >= dateRange.from && islemDate <= dateRange.to;
      });
    }
  });

  // Filter operations based on search and filter type
  const filteredOperations = operationsData.filter(operation => {
    // Apply date range filter
    const operationDate = new Date(operation.created_at || "");
    const isInDateRange = operationDate >= dateRange.from && operationDate <= dateRange.to;
    
    if (!isInDateRange) return false;
    
    // Apply search filter
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      !searchText || 
      (operation.personel?.ad_soyad || '').toLowerCase().includes(searchLower) ||
      (operation.aciklama || '').toLowerCase().includes(searchLower) ||
      (operation.musteri?.first_name + ' ' + operation.musteri?.last_name || '').toLowerCase().includes(searchLower);
    
    // Apply type filter
    if (filterType === "all") return matchesSearch;
    
    // Add more filter types as needed
    return matchesSearch;
  });

  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCount = filteredOperations.length;
  
  return (
    <StaffLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">İşlem Geçmişi</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Tarih Aralığı</label>
                <DateRangePicker 
                  from={dateRange.from}
                  to={dateRange.to}
                  onSelect={({from, to}) => setDateRange({from, to})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Arama</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search"
                    placeholder="Personel, işlem veya müşteri ara..." 
                    className="pl-8" 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Filtre</label>
                <Tabs defaultValue="all" className="w-full" value={filterType} onValueChange={setFilterType}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">Tümü</TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1">Tamamlanan</TabsTrigger>
                    <TabsTrigger value="cancelled" className="flex-1">İptal</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <div className="bg-gray-100 p-2 rounded-md">
              <span className="font-medium">Toplam İşlem:</span> 
              <span className="ml-1">{totalCount}</span>
            </div>
            <div className="bg-gray-100 p-2 rounded-md">
              <span className="font-medium">Toplam Ciro:</span> 
              <span className="ml-1 text-green-600">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
          
          <Button variant="outline">Rapor İndir</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notlar</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOperations.length > 0 ? (
                        filteredOperations.map((operation) => (
                          <tr key={operation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(operation.created_at || '').toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {operation.personel?.ad_soyad || 'Belirtilmemiş'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {operation.musteri 
                                ? `${operation.musteri.first_name} ${operation.musteri.last_name || ''}`
                                : 'Belirtilmemiş'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {operation.aciklama || (operation.islem?.islem_adi || 'Belirtilmemiş')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatCurrency(operation.tutar || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {operation.puan || 0}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {operation.notlar || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            Seçilen filtrelere uygun işlem bulunamadı
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
