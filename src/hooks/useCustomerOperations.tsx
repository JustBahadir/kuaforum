
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { PersonelIslemi } from "@/lib/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export function useCustomerOperations(customerId?: number) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 90)), // Default to last 90 days
    to: new Date()
  });
  const queryClient = useQueryClient();
  
  const { 
    data: operations = [], 
    isLoading,
    refetch,
    isError,
    error
  } = useQuery({
    queryKey: ['customerOperations', customerId, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!customerId) return [];
      
      console.log("Fetching operations for customer ID:", customerId);
      
      try {
        // First try to get operations directly
        const operations = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
        
        // Tarih aralığına göre filtreleme
        const filteredOperations = operations.filter(op => {
          if (!op.created_at) return false;
          const opDate = new Date(op.created_at);
          return opDate >= dateRange.from && opDate <= dateRange.to;
        });
        
        if (!filteredOperations || filteredOperations.length === 0) {
          // If no operations, try to recover from appointments
          console.log("No operations found, trying to recover from appointments");
          await personelIslemleriServisi.recoverOperationsFromCustomerAppointments(customerId);
          
          // Try to get operations again
          const retryOperations = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
          return retryOperations.filter(op => {
            if (!op.created_at) return false;
            const opDate = new Date(op.created_at);
            return opDate >= dateRange.from && opDate <= dateRange.to;
          }) || [];
        }
        
        return filteredOperations;
      } catch (error) {
        console.error("Error fetching customer operations:", error);
        toast.error("Müşteri işlemleri yüklenirken bir hata oluştu");
        return [];
      }
    },
    enabled: !!customerId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  const handleForceRecover = async () => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı");
      return;
    }
    
    try {
      toast.info("Tamamlanan randevular işleniyor...");
      await personelIslemleriServisi.recoverOperationsFromCustomerAppointments(customerId);
      
      // Update shop statistics
      await personelIslemleriServisi.updateShopStatistics();
      
      // Refetch operations
      await refetch();
      
      toast.success("İşlem geçmişi yenilendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi yenilenirken bir hata oluştu");
    }
  };
  
  // Calculate totals
  const totals = operations?.reduce((acc, op) => {
    acc.totalAmount += (op.tutar || 0);
    acc.totalPoints += (op.puan || 0);
    acc.totalPaid += (op.odenen || 0);
    return acc;
  }, { totalAmount: 0, totalPoints: 0, totalPaid: 0 });

  // Automatically recover operations on first load
  useEffect(() => {
    if (customerId && operations.length === 0 && !isLoading) {
      handleForceRecover();
    }
  }, [customerId, isLoading, operations.length]);

  return { 
    operations,
    isLoading,
    isError,
    error,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    handleForceRecover,
    refetch,
    totals
  };
}
