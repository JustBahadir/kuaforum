
import React from 'react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PersonelIslemi } from '@/lib/supabase/types';

export interface CustomerOperationsTableProps {
  operations?: PersonelIslemi[];
}

export function CustomerOperationsTable({ operations = [] }: CustomerOperationsTableProps) {
  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Bu müşteri için işlem geçmişi bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 px-4">Tarih</th>
            <th className="py-3 px-4">İşlem</th>
            <th className="py-3 px-4">Personel</th>
            <th className="py-3 px-4 text-right">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((operation) => (
            <tr key={operation.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                {format(new Date(operation.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
              </td>
              <td className="py-3 px-4">
                {operation.aciklama || (operation.islem?.islem_adi || 'Bilinmeyen İşlem')}
              </td>
              <td className="py-3 px-4">
                {operation.personel?.ad_soyad || 'Bilinmeyen Personel'}
              </td>
              <td className="py-3 px-4 text-right font-medium">
                {formatCurrency(operation.tutar || 0)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td colSpan={3} className="py-3 px-4 font-medium">
              Toplam
            </td>
            <td className="py-3 px-4 text-right font-medium">
              {formatCurrency(
                operations.reduce((sum, op) => sum + (op.tutar || 0), 0)
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
