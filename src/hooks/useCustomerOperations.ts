
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface CustomerOperation {
  id: number;
  operation_name: string;
  date: string;
  amount: number;
  staff_name: string;
}

export const useCustomerOperations = (customerId: string | number) => {
  const [operations, setOperations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchOperations = async () => {
    setIsLoading(true);
    try {
      // Call a custom function to get customer operations
      const { data, error } = await supabase
        .rpc('recover_customer_appointments', { p_customer_id: Number(customerId) });

      if (error) throw error;
      setOperations(data || []);
    } catch (err) {
      console.error("Müşteri işlemleri alınamadı:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchOperations();
    }
  }, [customerId]);

  return { operations, isLoading, error, refetch: fetchOperations };
};

// Export the type for use in components
export type { CustomerOperation };
