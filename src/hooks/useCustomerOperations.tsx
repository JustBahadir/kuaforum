
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

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
  const { dukkanId } = useCustomerAuth();

  useEffect(() => {
    const fetchOperations = async () => {
      if (!customerId || !dukkanId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch operations for the customer with proper dukkanId isolation
        const { data: operationsData, error: operationsError } = await supabase
          .from('personel_islemleri')
          .select(`
            id,
            musteri_id,
            tutar,
            aciklama,
            created_at,
            personel_id,
            odeme_yontemi,
            notlar,
            personel:personel_id (ad_soyad)
          `)
          .eq('musteri_id', customerId)
          .eq('personel:dukkan_id', dukkanId)  // Add shop isolation
          .order('created_at', { ascending: false })
          .limit(limit);

        if (operationsError) throw operationsError;

        // Process operations to match the expected format
        if (operationsData && operationsData.length > 0) {
          const enhancedOperations = operationsData.map(operation => {
            return {
              id: operation.id,
              customer_id: operation.musteri_id,
              amount: operation.tutar,
              description: operation.aciklama,
              created_at: operation.created_at,
              staff_id: operation.personel_id,
              staff_name: operation.personel?.ad_soyad || 'Bilinmiyor',
              status: 'tamamlandı',
              payment_method: operation.odeme_yontemi || 'nakit',
              notes: operation.notlar
            };
          });

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
  }, [customerId, limit, dukkanId]);

  return { operations, loading, error };
};
