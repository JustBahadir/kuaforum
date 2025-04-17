
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { formatDate, formatDateShort, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export interface OperationsHistoryTabProps {
  personnel: any;
}

export function OperationsHistoryTab({ personnel }: OperationsHistoryTabProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date()
  });

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['personnel-operations', personnel.id, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!personnel.id) return [];
      const allOperations = await personelIslemleriServisi.personelIslemleriGetir(personnel.id);
      return allOperations.filter(op => {
        if (!op.created_at) return false;
        const date = new Date(op.created_at);
        return date >= dateRange.from && date <= dateRange.to;
      });
    }
  });

  const totalRevenue = operations.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0);
  const totalCommission = operations.reduce((sum, op) => sum + (Number(op.odenen) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-base font-medium">İşlem Geçmişi</h3>
        <DateRangePicker 
          from={dateRange.from}
          to={dateRange.to}
          onSelect={(range) => setDateRange(range)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">İşlem Sayısı</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold">{operations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Toplam Ciro</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Toplam Prim</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCommission)}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="w-8 h-8 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
        </div>
      ) : operations.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Seçilen tarih aralığında işlem bulunamadı.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Tarih</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">İşlem</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Müşteri</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Tutar</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Prim %</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Prim</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.map((op) => (
                <tr key={op.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDateShort(op.created_at)}</td>
                  <td className="px-4 py-2 text-sm">{op.islem?.islem_adi || op.aciklama}</td>
                  <td className="px-4 py-2 text-sm">
                    {op.musteri ? `${op.musteri.first_name || ''} ${op.musteri.last_name || ''}` : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(op.tutar)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{op.prim_yuzdesi ? `%${op.prim_yuzdesi}` : '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(op.odenen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
