import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export interface PersonnelOperationsTableProps {
  personnelId?: number;
  personelId?: number; // For backwards compatibility
}

export function PersonnelOperationsTable({ personnelId, personelId }: PersonnelOperationsTableProps) {
  const actualPersonnelId = personnelId || personelId;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [operations, setOperations] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchOperations() {
      if (!actualPersonnelId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.info("Fetching operations for personnel ID:", actualPersonnelId);
        console.info("Directly fetching operations for personnel ID:", actualPersonnelId);
        const results = await personelIslemleriServisi.personelIslemleriGetirById(actualPersonnelId);
        setOperations(results);
      } catch (err) {
        console.error("Error fetching personnel operations:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOperations();
  }, [actualPersonnelId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">İşlem verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <p className="text-red-600 font-medium">İşlem geçmişi yüklenirken bir hata oluştu</p>
        <p className="text-red-500 text-sm mt-1">{error.message || "Bilinmeyen hata"}</p>
        <button 
          className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded transition-colors"
          onClick={() => window.location.reload()}
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  if (!operations || operations.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Bu personel için işlem geçmişi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operations.map((operation) => (
            <tr key={operation.id} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.created_at ? format(new Date(operation.created_at), "dd.MM.yyyy HH:mm") : "Bilinmiyor"}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.aciklama}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.musteri ? 
                  `${operation.musteri.first_name} ${operation.musteri.last_name || ''}` : 
                  "Belirtilmemiş"}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {formatCurrency(operation.tutar || 0)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {operation.puan}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
