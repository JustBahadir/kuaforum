
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface CustomerOperation {
  id: number;
  customer_id: number;
  service_id: number;
  staff_id: number;
  amount: number;
  description: string;
  staff_name: string;
  created_at: string;
  updated_at: string;
  status: 'completed' | 'cancelled' | 'pending';
}

interface UseCustomerOperationsProps {
  customerId: number | string;
}

export const useCustomerOperations = ({ customerId }: UseCustomerOperationsProps) => {
  const [operations, setOperations] = useState<CustomerOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomerOperations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch customer operations from Supabase
        const { data, error } = await supabase
          .from('customer_operations')
          .select(`
            id, 
            customer_id, 
            service_id, 
            staff_id,
            amount, 
            description, 
            created_at, 
            updated_at, 
            status,
            staff:staff_id (name, first_name, last_name)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        // Process the fetched data to include staff names
        const processedData = data.map((op) => ({
          ...op,
          staff_name: op.staff ? 
            `${op.staff.first_name || ''} ${op.staff.last_name || ''}` : 
            op.staff?.name || 'Bilinmiyor'
        }));

        setOperations(processedData);
      } catch (err) {
        console.error('Error fetching customer operations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerOperations();
    }
  }, [customerId]);

  return { operations, loading, error };
};
