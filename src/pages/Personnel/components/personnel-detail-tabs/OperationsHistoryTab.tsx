
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  formatDateShort,
} from "@/lib/utils";
import { DateControlBar } from "@/components/ui/date-control-bar"; 

interface PersonelIslemi {
  id: number;
  tutar: number;
  created_at: string;
  aciklama: string;
  personel_id: number;
  islem_id: number;
  musteri_id: number;
  personel?: { id: number; ad_soyad: string };
  islem?: { id: number; islem_adi: string };
  musteri?: { id: number; first_name: string; last_name: string };
  prim_yuzdesi?: number;
  odenen?: number;
}

export interface OperationsHistoryTabProps {
  personnel: any;
  isLoading?: boolean;
}

export function OperationsHistoryTab({ 
  personnel,
  isLoading = false,
}: OperationsHistoryTabProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  // This is a placeholder for demonstration - in a real app, you'd fetch operations here
  const [operations, setOperations] = useState<PersonelIslemi[]>([]);
  const [useSingleDate, setUseSingleDate] = useState(false);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setUseSingleDate(false);
    // Fetch operations based on new date range
  };

  const handleSingleDateChange = (date: Date) => {
    setDateRange({ from: date, to: date });
    setUseSingleDate(true);
    // Fetch operations for single date
  };

  // This would be called to fetch operations when the component mounts or date range changes
  const fetchOperations = () => {
    // Implementation would go here
  };

  // Calculate totals
  const totalRevenue = operations.reduce((sum, op) => sum + (op.tutar || 0), 0);
  const totalCommission = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <DateControlBar
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          showMonthCycle={true}
          initialMode={useSingleDate ? 'single' : 'range'}
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>İşlem Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
            </div>
          ) : operations.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <p>Seçilen tarih aralığında işlem bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-sm text-muted-foreground">Tarih</th>
                    <th className="px-3 py-2 text-left font-medium text-sm text-muted-foreground">Müşteri</th>
                    <th className="px-3 py-2 text-left font-medium text-sm text-muted-foreground">İşlem</th>
                    <th className="px-3 py-2 text-right font-medium text-sm text-muted-foreground">Tutar</th>
                    <th className="px-3 py-2 text-right font-medium text-sm text-muted-foreground">Komisyon</th>
                    <th className="px-3 py-2 text-right font-medium text-sm text-muted-foreground">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((operation) => {
                    const commission = (operation.tutar * (operation.prim_yuzdesi || 0)) / 100;
                    const net = operation.tutar - commission;
                    
                    return (
                      <tr key={operation.id} className="border-b hover:bg-muted/50">
                        <td className="px-3 py-2 text-sm">
                          {formatDateShort(operation.created_at)}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {operation.musteri ? `${operation.musteri.first_name} ${operation.musteri.last_name}` : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {operation.islem?.islem_adi || operation.aciklama}
                        </td>
                        <td className="px-3 py-2 text-sm text-right">
                          {formatCurrency(operation.tutar)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right">
                          {formatCurrency(commission)}
                        </td>
                        <td className="px-3 py-2 text-sm text-right">
                          {formatCurrency(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-t-2">
                    <td className="px-3 py-2 font-medium" colSpan={3}>Toplam</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(totalRevenue)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(totalCommission)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(totalRevenue - totalCommission)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
