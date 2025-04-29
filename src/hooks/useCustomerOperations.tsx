
import { useState, useEffect } from 'react';
import { personelIslemleriServisi } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseCustomerOperationsProps {
  customerId?: number;
  startDate?: string;
  endDate?: string;
}

export const useCustomerOperations = ({ 
  customerId,
  startDate,
  endDate
}: UseCustomerOperationsProps) => {
  const [loading, setLoading] = useState(false);
  const [operations, setOperations] = useState([]);
  const [error, setError] = useState<Error | null>(null);

  // Use React Query for data fetching
  const {
    data: fetchedOperations = [],
    isLoading: isQueryLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['customerOperations', customerId, startDate, endDate],
    queryFn: async () => {
      if (!customerId) return [];
      
      try {
        // Get all operations and filter by customer ID
        let allOperations = await personelIslemleriServisi.hepsiniGetir();
        
        // Filter by customer ID
        let filtered = allOperations.filter(op => op.musteri_id === customerId);
        
        // Further filter by date range if provided
        if (startDate && endDate) {
          filtered = filtered.filter(op => {
            const opDate = new Date(op.created_at);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return opDate >= start && opDate <= end;
          });
        }
        
        return filtered;
      } catch (error: any) {
        console.error("Error fetching customer operations:", error);
        throw new Error(error.message || "Failed to load operations");
      }
    },
    enabled: !!customerId,
  });

  // Update local state when query data changes
  useEffect(() => {
    if (fetchedOperations) {
      setOperations(fetchedOperations);
    }
  }, [fetchedOperations]);

  // Handle query states
  useEffect(() => {
    setLoading(isQueryLoading);
    if (isError) {
      setError(new Error("Failed to fetch customer operations"));
    } else {
      setError(null);
    }
  }, [isQueryLoading, isError]);

  // Method to add a new operation
  const addOperation = async (operationData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure customer ID is set
      const dataToSend = {
        ...operationData,
        musteri_id: customerId
      };
      
      const result = await personelIslemleriServisi.ekle(dataToSend);
      
      if (result) {
        toast.success("İşlem başarıyla eklendi");
        // Refresh the data
        await refetch();
        
        // Note: We're not using updateShopStatistics since it doesn't exist
        // but we'll handle shop statistics updates elsewhere
        
        return result;
      } else {
        throw new Error("İşlem eklenemedi");
      }
    } catch (err: any) {
      console.error("Error adding operation:", err);
      setError(err);
      toast.error(err.message || "İşlem eklenirken bir hata oluştu");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    operations,
    loading,
    error,
    addOperation,
    refetch
  };
};
