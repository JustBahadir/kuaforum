
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerOperationsService } from "@/lib/supabase/services/customerOperationsService";
import { PersonelIslemi } from "@/lib/supabase/types";
import { useState } from "react";
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

  return {
    operations,
    isLoading,
    addOperation,
    addOperationPhoto,
    updateOperationNotes,
    recoverOperations,
    isRecovering,
    refetch
  };
}
