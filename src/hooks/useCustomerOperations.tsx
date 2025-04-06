
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personelIslemleriServisi } from "@/lib/supabase/services/personelIslemleriServisi";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { PersonelIslemi } from "@/lib/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

// Define the Supabase URL for API calls
const SUPABASE_URL = "https://xkbjjcizncwkrouvoujw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmpqY2l6bmN3a3JvdXZvdWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5Njg0NzksImV4cCI6MjA1NTU0NDQ3OX0.RyaC2G1JPHUGQetAcvMgjsTp_nqBB2rZe3U-inU2osw";

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
        // First try to get operations directly using our improved service
        const operations = await customerOperationsService.getCustomerOperations(customerId);
        
        // Filter by date range
        const filteredOperations = operations.filter(op => {
          if (!op.date) return false;
          const opDate = new Date(op.date);
          return opDate >= dateRange.from && opDate <= dateRange.to;
        });
        
        return filteredOperations;
      } catch (error) {
        console.error("Error fetching customer operations:", error);
        toast.error("Müşteri işlemleri yüklenirken bir hata oluştu");
        return [];
      }
    },
    enabled: !!customerId,
    staleTime: 5000, // Keep data fresh for 5 seconds
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  const handleForceRecover = async () => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı");
      return;
    }
    
    try {
      toast.info("Tamamlanan randevular işleniyor...");
      
      // Call the edge function directly with the URL constants
      const response = await fetch(`${SUPABASE_URL}/functions/v1/recover_customer_operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ customer_id: customerId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from edge function:", errorText);
        throw new Error("İşlem geçmişi yenilenirken bir hata oluştu");
      }
      
      const result = await response.json();
      
      // Update shop statistics
      await personelIslemleriServisi.updateShopStatistics();
      
      // Refetch operations
      await refetch();
      
      toast.success(`İşlem geçmişi yenilendi (${result.count || 0} işlem)`);
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlem geçmişi yenilenirken bir hata oluştu");
    }
  };
  
  // Calculate totals
  const totals = operations?.reduce((acc, op) => {
    acc.totalAmount += (op.amount || 0);
    acc.totalPoints += (op.points || 0);
    acc.totalPaid += 0; // This needs to be fixed if we have paid data
    return acc;
  }, { totalAmount: 0, totalPoints: 0, totalPaid: 0 });

  // Automatically recover operations on first load if none found
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
