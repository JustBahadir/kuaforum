
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

export interface CustomerOperation {
  id: number;
  customer_id: number | string;
  amount?: number;
  description?: string;
  created_at: string;
  staff_id?: number | string;
  staff_name?: string;
  status?: string;
  payment_method?: string;
  notes?: string;
}

interface UseCustomerOperationsProps {
  customerId: number | string;
  limit?: number;
}

export const useCustomerOperations = ({ customerId, limit = 10 }: UseCustomerOperationsProps) => {
  const [operations, setOperations] = useState<CustomerOperation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOperations = async () => {
      if (!customerId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch operations for the customer
        const { data: operationsData, error: operationsError } = await supabase
          .from('islemler')
          .select('*')
          .eq('musteri_id', customerId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (operationsError) throw operationsError;

        // Process operations (get staff names)
        if (operationsData && operationsData.length > 0) {
          const enhancedOperations = await Promise.all(
            operationsData.map(async (operation) => {
              let staffName = 'Bilinmiyor';

              if (operation.personel_id) {
                const { data: staffData, error: staffError } = await supabase
                  .from('personel')
                  .select('ad_soyad')
                  .eq('id', operation.personel_id)
                  .maybeSingle();

                if (!staffError && staffData) {
                  staffName = staffData.ad_soyad;
                }
              }

              return {
                id: operation.id,
                customer_id: operation.musteri_id,
                amount: operation.tutar,
                description: operation.islem_tanimi,
                created_at: operation.created_at,
                staff_id: operation.personel_id,
                staff_name: staffName,
                status: operation.durum || 'tamamlandı',
                payment_method: operation.odeme_yontemi || 'nakit',
                notes: operation.notlar
              };
            })
          );

          setOperations(enhancedOperations);
        } else {
          setOperations([]);
        }
      } catch (err: any) {
        console.error('Müşteri işlemleri yüklenirken hata:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, [customerId, limit]);

  return { operations, loading, error };
};
