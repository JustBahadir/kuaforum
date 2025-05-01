
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { islemServisi, personelIslemleriServisi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currencyFormatter";
import { DataTable } from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface OperationsHistoryTabProps {
  personnelId: number;
}

export function OperationsHistoryTab({ personnelId }: OperationsHistoryTabProps) {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["personnel-operations", personnelId],
    queryFn: async () => {
      if (!personnelId) return [];
      try {
        // Use personelIslemleriServisi to get operations
        const data = await personelIslemleriServisi.personelIslemleriniGetir(personnelId);
        return data;
      } catch (error) {
        console.error("Personnel operations fetch error:", error);
        return [];
      }
    },
    enabled: !!personnelId,
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>İşlem Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operations.map((op: any) => (
                    <tr key={op.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(op.created_at), "dd MMMM yyyy HH:mm", { locale: tr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{op.aciklama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {op.musteri?.first_name} {op.musteri?.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(op.tutar)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{op.puan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">Henüz işlem kaydı bulunmamaktadır.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
