
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PersonelIslemi, personelIslemleriServisi } from "@/lib/supabase";
import { format } from "date-fns";

interface CustomerOperationsTableProps {
  customerId: string;
}

export function CustomerOperationsTable({ customerId }: CustomerOperationsTableProps) {
  const { data: islemler = [], isLoading } = useQuery({
    queryKey: ['musteriIslemleri', customerId],
    queryFn: () => personelIslemleriServisi.hepsiniGetir(), // Using hepsiniGetir for now
    enabled: !!customerId
  });

  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (islemler.length === 0) {
    return <div className="text-center py-4">Bu müşteriye ait işlem bulunamadı.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {islemler.map((islem: PersonelIslemi) => (
            <tr key={islem.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {islem.created_at ? format(new Date(islem.created_at), 'dd.MM.yyyy') : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {islem.islem?.islem_adi || 'Bilinmeyen İşlem'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {/* Burada personel ad soyadı olmalı, ancak şu anda doğrudan almıyoruz */}
                Personel #{islem.personel_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {islem.tutar} TL
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                {islem.aciklama}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
