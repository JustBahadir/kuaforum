
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Define interface for customer operation
export interface CustomerOperation {
  id: number | string;
  created_at: string;
  aciklama?: string;
  personel_name?: string;
  tutar?: number;
  // Add other fields as needed
}

// Mock service until the real one is implemented
const customerOperationsService = {
  getCustomerOperations: async (customerId: number | string): Promise<CustomerOperation[]> => {
    // This would be replaced with actual API call
    console.log(`Fetching operations for customer ${customerId}`);
    return [];
  },
  
  addCustomerOperation: async (data: Partial<CustomerOperation>) => {
    console.log('Adding operation:', data);
    return { id: 'new-id', ...data };
  }
};

interface UseCustomerOperationsProps {
  customerId?: number | string;
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
  const addOperation = async (operationData: Partial<CustomerOperation>) => {
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
