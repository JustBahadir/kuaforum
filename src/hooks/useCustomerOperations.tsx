
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { PersonelIslemi } from "@/lib/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export function useCustomerOperations(customerId?: number) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { 
    data: operations = [], 
    isLoading,
    refetch,
    isError,
    error
  } = useQuery({
    queryKey: ['customerOperations', customerId, selectedDate],
    queryFn: async () => {
      if (!customerId) return [];
      
      console.log("Fetching operations for customer ID:", customerId);
      
      try {
        // First try to get operations directly
        const operations = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
        
        if (!operations || operations.length === 0) {
          // If no operations, try to recover from appointments
          console.log("No operations found, trying to recover from appointments");
          await personelIslemleriServisi.recoverOperationsFromCustomerAppointments(customerId);
          
          // Try to get operations again
          const retryOperations = await personelIslemleriServisi.musteriIslemleriGetir(customerId);
          return retryOperations || [];
        }
        
        return operations;
      } catch (error) {
        console.error("Error fetching customer operations:", error);
        toast.error("Müşteri işlemleri yüklenirken bir hata oluştu");
        return [];
      }
    },
    enabled: !!customerId
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

  return { 
    operations,
    isLoading,
    isError,
    error,
    selectedDate,
    setSelectedDate,
    handleForceRecover,
    refetch,
    totals
  };
}
