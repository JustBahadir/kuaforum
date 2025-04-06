
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { PersonelIslemi } from "@/lib/supabase/types";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export function useCustomerOperations(customerId?: number | string) {
  const queryClient = useQueryClient();
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Get customer operations
  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ['customerOperations', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      return await customerOperationsService.getCustomerOperations(customerId);
    },
    enabled: !!customerId,
  });
  
  // Calculate totals from operations
  const totals = useMemo(() => {
    const totalAmount = operations.reduce((sum, op) => sum + (op.amount || op.tutar || 0), 0);
    const totalPaid = operations.reduce((sum, op) => sum + (op.odenen || 0), 0);
    const totalPoints = operations.reduce((sum, op) => sum + (op.points || op.puan || 0), 0);
    
    return { totalAmount, totalPaid, totalPoints };
  }, [operations]);
  
  // Add operation mutation
  const addOperation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await supabase.functions.invoke('add-operation', {
        body: data
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("İşlem başarıyla eklendi");
    },
    onError: (error) => {
      console.error("Error adding operation:", error);
      toast.error("İşlem eklenirken bir hata oluştu");
    }
  });
  
  // Add operation photo mutation
  const addOperationPhoto = useMutation({
    mutationFn: async ({ operationId, photoUrl }: { operationId: number; photoUrl: string }) => {
      const { data: result } = await supabase.functions.invoke('add-operation-photo', {
        body: { operationId, photoUrl }
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("Fotoğraf başarıyla eklendi");
    },
    onError: (error) => {
      console.error("Error adding photo:", error);
      toast.error("Fotoğraf eklenirken bir hata oluştu");
    }
  });
  
  // Update operation notes mutation
  const updateOperationNotes = useMutation({
    mutationFn: async ({ operationId, notes }: { operationId: number; notes: string }) => {
      const { data: result } = await supabase.functions.invoke('update-operation-notes', {
        body: { operationId, notes }
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOperations'] });
      toast.success("Notlar başarıyla güncellendi");
    },
    onError: (error) => {
      console.error("Error updating notes:", error);
      toast.error("Notlar güncellenirken bir hata oluştu");
    }
  });
  
  // Recover operations from appointments
  const recoverOperations = async () => {
    if (!customerId) return;
    
    try {
      setIsRecovering(true);
      toast.info("İşlemler yenileniyor...");
      
      const { data, error } = await supabase.functions.invoke('recover_customer_operations', {
        body: { customerId }
      });
      
      if (error) throw error;
      
      await refetch();
      
      toast.success(data?.message || "İşlemler başarıyla yenilendi");
    } catch (error) {
      console.error("Error recovering operations:", error);
      toast.error("İşlemler yenilenirken bir hata oluştu");
    } finally {
      setIsRecovering(false);
    }
  };

  // Add handleForceRecover as an alias for recoverOperations to maintain compatibility
  const handleForceRecover = recoverOperations;

  return {
    operations,
    isLoading,
    addOperation,
    addOperationPhoto,
    updateOperationNotes,
    recoverOperations,
    handleForceRecover, // Added this property
    isRecovering,
    refetch,
    totals // Added the totals property
  };
}
