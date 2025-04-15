
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface OperationsHistoryTabProps {
  personnel: any;
  operations?: any[];
  isLoading?: boolean;
}

export function OperationsHistoryTab({ personnel, operations = [], isLoading = false }: OperationsHistoryTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">İşlem geçmişi bulunamadı.</p>
      </div>
    );
  }

  // Sort operations by date (newest first)
  const sortedOperations = [...operations].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prim %</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kazanç</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOperations.map((operation) => (
              <tr key={operation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {operation.created_at ? format(new Date(operation.created_at), "dd MMM yyyy", { locale: tr }) : "Belirtilmemiş"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {operation.musteri ? `${operation.musteri.first_name} ${operation.musteri.last_name || ''}` : "Belirtilmemiş"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {operation.islem?.islem_adi || operation.aciklama || "Belirtilmemiş"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(operation.tutar)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  %{operation.prim_yuzdesi || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(operation.odenen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Toplam İşlem</span>
          <span className="text-sm font-medium">{operations.length}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-muted-foreground">Toplam Ciro</span>
          <span className="text-sm font-medium">
            {formatCurrency(operations.reduce((sum, op) => sum + (Number(op.tutar) || 0), 0))}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-muted-foreground">Toplam Kazanç</span>
          <span className="text-sm font-medium text-success">
            {formatCurrency(operations.reduce((sum, op) => sum + (Number(op.odenen) || 0), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
