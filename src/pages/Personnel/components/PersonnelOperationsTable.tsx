import React from 'react';
import { PersonelIslemi } from '@/lib/supabase/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PersonnelOperationsTableProps {
  operations: PersonelIslemi[];
}

export function PersonnelOperationsTable({ operations }: PersonnelOperationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarih
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Açıklama
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tutar
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ödenen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prim Yüzdesi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Puan
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operations.map((operation) => (
            <tr key={operation.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {operation.tarih ? format(new Date(operation.tarih), 'dd MMMM yyyy', { locale: tr }) : 'Belirtilmemiş'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{operation.aciklama}</div>
                {operation.aciklama && <p className="text-xs text-gray-500">{operation.aciklama}</p>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{operation.tutar}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{operation.odenen}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{operation.prim_yuzdesi}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{operation.puan}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
