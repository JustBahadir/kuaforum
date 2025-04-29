
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerOperationsService } from '@/lib/supabase/services/customerOperationsService';

interface UseCustomerOperationsProps {
  customerId?: number;
  limit?: number;
}

export const useCustomerOperations = (props?: UseCustomerOperationsProps) => {
  const { customerId, limit } = props || {};

  // Fetch operations for a customer
  const { data: operations = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      if (customerId) {
        const data = await customerOperationsService.getCustomerOperations(customerId);
        return limit ? data.slice(0, limit) : data;
      }
      return [];
    },
    enabled: !!customerId,
  });

  // Add a new operation
  const addOperation = async (operationData: any) => {
    try {
      const result = await customerOperationsService.addCustomerOperation(operationData);
      // Refetch operations after adding a new one
      refetch();
      return result;
    } catch (error) {
      console.error("Error adding operation:", error);
      throw error;
    }
  };

  return {
    operations,
    loading,
    error,
    addOperation,
    refetch,
  };
};
