
import { supabase } from "@/lib/supabase/client";

export type CustomerOperation = {
  id: number;
  customer_id: number | string;
  operation_date: string;
  operation_type: string;
  service_id?: number;
  staff_id?: number;
  notes?: string;
  price?: number;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
  photos?: string[];
  // These are joined fields from other tables
  service?: { id: number; name: string; price: number };
  staff?: { id: number; name: string };
};

export const customerOperationsService = {
  // Get operations for a specific customer
  getCustomerOperations: async (customerId: string | number): Promise<CustomerOperation[]> => {
    const { data, error } = await supabase
      .from("customer_operations")
      .select(`
        *,
        service:service_id (id, name, price),
        staff:staff_id (id, name)
      `)
      .eq("customer_id", customerId)
      .order("operation_date", { ascending: false });

    if (error) {
      console.error("Error fetching customer operations:", error);
      throw error;
    }

    return data || [];
  },

  // Add a new customer operation
  addCustomerOperation: async (operationData: Omit<CustomerOperation, "id" | "created_at">): Promise<CustomerOperation> => {
    const { data, error } = await supabase
      .from("customer_operations")
      .insert(operationData)
      .select()
      .single();

    if (error) {
      console.error("Error adding customer operation:", error);
      throw error;
    }

    return data;
  },

  // Recover operations from appointments table
  recoverOperationsFromRandevular: async (customerId: string | number): Promise<{ added: number }> => {
    const { data, error } = await supabase
      .rpc("recover_customer_operations", { p_customer_id: customerId });

    if (error) {
      console.error("Error recovering operations:", error);
      throw error;
    }

    return data || { added: 0 };
  },

  // Update operation notes
  updateOperationNotes: async (operationId: number, notes: string): Promise<CustomerOperation> => {
    const { data, error } = await supabase
      .from("customer_operations")
      .update({ notes })
      .eq("id", operationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating operation notes:", error);
      throw error;
    }

    return data;
  },

  // Add photo URL to operation
  addOperationPhoto: async (operationId: number, photoUrl: string): Promise<CustomerOperation> => {
    // First get the current photos array
    const { data: currentData, error: fetchError } = await supabase
      .from("customer_operations")
      .select("photos")
      .eq("id", operationId)
      .single();

    if (fetchError) {
      console.error("Error fetching operation photos:", fetchError);
      throw fetchError;
    }

    // Update with new photo added to array
    const currentPhotos = currentData?.photos || [];
    const updatedPhotos = [...currentPhotos, photoUrl];

    const { data, error } = await supabase
      .from("customer_operations")
      .update({ photos: updatedPhotos })
      .eq("id", operationId)
      .select()
      .single();

    if (error) {
      console.error("Error adding operation photo:", error);
      throw error;
    }

    return data;
  }
};
