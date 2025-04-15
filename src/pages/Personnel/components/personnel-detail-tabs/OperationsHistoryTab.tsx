
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/utils";
import { CustomMonthCycleSelector } from "@/components/ui/custom-month-cycle-selector";
import { Input } from "@/components/ui/input";
import { Search, RefreshCcw } from "lucide-react";

interface OperationsHistoryTabProps {
  personnel: any;
}

export function OperationsHistoryTab({ personnel }: OperationsHistoryTabProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ['personnel-operations-history', personnel.id, dateRange.from, dateRange.to],
    queryFn: async () => {
      try {
        const operations = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
        
        return operations.filter(op => {
          if (!op.created_at) return false;
          const date = new Date(op.created_at);
          return date >= dateRange.from && date <= dateRange.to;
        });
      } catch (error) {
        console.error("Error fetching personnel operations:", error);
        return [];
      }
    },
  });

  const filteredOperations = useMemo(() => {
    if (!searchTerm.trim()) return operations;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return operations.filter((op: any) => {
      const customerName = op.musteri 
        ? `${op.musteri.first_name} ${op.musteri.last_name || ''}`.toLowerCase() 
        : '';
      const operationName = (op.islem?.islem_adi || op.aciklama || '').toLowerCase();
      
      return customerName.includes(searchLower) || operationName.includes(searchLower);
    });
  }, [operations, searchTerm]);

  const summary = useMemo(() => {
    if (!operations.length) return { totalOperations: 0, totalRevenue: 0, totalCommission: 0 };
    
    return operations.reduce((acc, op) => ({
      totalOperations: acc.totalOperations + 1,
      totalRevenue: acc.totalRevenue + (Number(op.tutar) || 0),
      totalCommission: acc.totalCommission + (Number(op.odenen) || 0)
    }), { totalOperations: 0, totalRevenue: 0, totalCommission: 0 });
  }, [operations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Müşteri veya işlem ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
        
        <button
          className="flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100"
          onClick={() => refetch()}
        >
          <RefreshCcw size={16} />
          <span>Yenile</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="text-sm bg-gray-100 p-2 rounded-md flex items-center gap-1">
          <span className="font-medium">Toplam İşlem:</span> 
          <span>{summary.totalOperations}</span>
        </div>
        <div className="text-sm bg-gray-100 p-2 rounded-md">
          <span className="font-medium">Toplam Ciro:</span> 
          <span className="text-green-600">{formatCurrency(summary.totalRevenue)}</span>
        </div>
        <div className="text-sm bg-gray-100 p-2 rounded-md">
          <span className="font-medium">Toplam Ödenen:</span> 
          <span className="text-blue-600">{formatCurrency(summary.totalCommission)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">
            {searchTerm ? "Arama kriterlerine uygun işlem bulunamadı." : "Bu personel için işlem kaydı bulunamadı."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOperations.map((op: any) => (
                <tr key={op.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(op.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.islem?.islem_adi || op.aciklama || 'Belirtilmemiş'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.musteri 
                      ? `${op.musteri.first_name} ${op.musteri.last_name || ''}` 
                      : 'Belirtilmemiş'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {op.prim_yuzdesi > 0 ? `%${op.prim_yuzdesi}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(op.tutar || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {op.prim_yuzdesi > 0 ? formatCurrency(op.odenen || 0) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
