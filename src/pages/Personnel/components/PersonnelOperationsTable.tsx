
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { personelIslemleriServisi } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonnelOperationsTableProps {
  personnelId: number;
}

export function PersonnelOperationsTable({ personnelId }: PersonnelOperationsTableProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });

  const { data: operationsData = [], isLoading } = useQuery({
    queryKey: ['personnel-operations', personnelId, dateRange.from, dateRange.to],
    queryFn: async () => {
      const allOperations = await personelIslemleriServisi.hepsiniGetir();
      
      // Filter for specific personnel and date range
      return allOperations.filter(op => {
        if (op.personel_id !== personnelId) return false;
        
        // Filter by date if created_at exists
        if (!op.created_at) return true;
        
        const opDate = new Date(op.created_at);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        
        return opDate >= fromDate && opDate <= toDate;
      });
    },
    enabled: !!personnelId
  });

  // Calculate totals
  const totalRevenue = operationsData.reduce((sum, op) => sum + Number(op.tutar || 0), 0);
  const totalCommission = operationsData.reduce((sum, op) => sum + Number(op.odenen || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h3 className="text-lg font-medium">İşlem Geçmişi</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full sm:w-auto">
          <span className="text-sm text-muted-foreground">Tarih aralığı seçin:</span>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={({from, to}) => setDateRange({from, to})}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="bg-gray-100 p-2 rounded-md">
          <span className="text-sm font-medium">Toplam İşlem: </span>
          <span className="text-sm">{operationsData.length}</span>
        </div>
        <div className="bg-gray-100 p-2 rounded-md">
          <span className="text-sm font-medium">Toplam Ciro: </span>
          <span className="text-sm text-green-600">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="bg-gray-100 p-2 rounded-md">
          <span className="text-sm font-medium">Toplam Ödenen: </span>
          <span className="text-sm text-blue-600">{formatCurrency(totalCommission)}</span>
        </div>
      </div>
      
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : operationsData.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödenen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operationsData.map((op: any) => (
                <tr key={op.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {op.created_at ? new Date(op.created_at).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {op.aciklama}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {op.musteri?.first_name} {op.musteri?.last_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(op.tutar || 0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {op.prim_yuzdesi ? `%${op.prim_yuzdesi}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(op.odenen || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-6 text-gray-500">
            Seçilen tarih aralığında işlem bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}
