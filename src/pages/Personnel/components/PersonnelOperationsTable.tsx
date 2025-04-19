
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi, personelServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DateControlBar } from "@/components/ui/date-control-bar";
import { createMonthCycleDateRange } from "@/utils/dateUtils";
import { startOfDay, endOfDay } from "date-fns";

interface PersonnelOperationsTableProps {
  personnelId?: number;
}

export function PersonnelOperationsTable({ 
  personnelId 
}: PersonnelOperationsTableProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isMonthCycleActive, setIsMonthCycleActive] = useState(false);

  const handleDateRangeChange = (newRange: {from: Date, to: Date}) => {
    setDateRange(newRange);
    setIsMonthCycleActive(false);
  };

  const handleSingleDateSelect = (date: Date) => {
    // For single day selection, set from to start of day and to to end of day
    setDateRange({
      from: startOfDay(date),
      to: endOfDay(date)
    });
    setIsMonthCycleActive(false);
  };

  const handleMonthCycleChange = (day: number, cycleDate: Date) => {
    setIsMonthCycleActive(true);
    const { from, to } = createMonthCycleDateRange(day);
    setDateRange({ from, to });
  };

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnel-operations', personnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        const data = personnelId
          ? await personelIslemleriServisi.personelIslemleriGetir(personnelId)
          : await personelIslemleriServisi.hepsiniGetir();
        
        return data.filter(op => {
          if (!op.created_at) return false;
          const date = new Date(op.created_at);
          return date >= dateRange.from && date <= dateRange.to;
        });
      } catch (error) {
        console.error("Failed to fetch operations:", error);
        return [];
      }
    },
    enabled: true,
  });

  const { data: personnelData = [] } = useQuery({
    queryKey: ['personnel-list-for-table'],
    queryFn: () => personelServisi.hepsiniGetir(),
  });

  const filteredOperations = operations.filter(op => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const personnelName = personnelData.find(p => p.id === op.personel_id)?.ad_soyad?.toLowerCase() || '';
    const customerName = op.musteri 
      ? `${op.musteri.first_name || ''} ${op.musteri.last_name || ''}`.toLowerCase()
      : '';
    const operationName = op.islem?.islem_adi?.toLowerCase() || op.aciklama?.toLowerCase() || '';
    
    return personnelName.includes(searchLower) || 
           customerName.includes(searchLower) || 
           operationName.includes(searchLower);
  });

  const totalRevenue = filteredOperations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const operationCount = filteredOperations.length;
  const totalCommission = filteredOperations.reduce((sum, op) => sum + (op.odenen || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ara: Müşteri, İşlem..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DateControlBar 
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onSingleDateChange={handleSingleDateSelect}
            onMonthCycleChange={handleMonthCycleChange}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <div className="bg-gray-100 p-2 rounded-md">
            <span className="font-medium">Toplam İşlem:</span> 
            <span className="ml-1">{operationCount}</span>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <span className="font-medium">Toplam Ciro:</span> 
            <span className="ml-1 text-green-600">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <span className="font-medium">Toplam Prim:</span> 
            <span className="ml-1 text-blue-600">{formatCurrency(totalCommission)}</span>
          </div>
        </div>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4">
                  <div className="flex justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-t-purple-500 border-purple-200 rounded-full"></div>
                  </div>
                </td>
              </tr>
            ) : filteredOperations.length > 0 ? (
              filteredOperations.map((op) => (
                <tr key={op.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.created_at ? new Date(op.created_at).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {personnelData?.find(p => p.id === op.personel_id)?.ad_soyad || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.musteri ? `${op.musteri.first_name || ''} ${op.musteri.last_name || ''}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.islem?.islem_adi || (op.aciklama ? op.aciklama.split(' hizmeti verildi')[0] : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.prim_yuzdesi > 0 ? `%${op.prim_yuzdesi}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(op.tutar || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {op.prim_yuzdesi > 0 ? formatCurrency(op.odenen || 0) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? "Arama kriterleriyle eşleşen işlem bulunamadı" : "Bu personel için işlem bulunmamaktadır"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
