
import { supabase } from '../client';

export interface CustomerPersonalData {
  id?: number;
  customer_id: string; 
  horoscope?: string | null;
  horoscope_description?: string | null;
  birth_date?: string | null;
  anniversary_date?: string | null;
  children_names?: string[];
  custom_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const customerPersonalDataService = {
  // Get personal data for a customer
  async getByCustomerId(customerId: string) {
    console.log("Getting personal data for customer:", customerId);
    try {
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer personal data:", error);
        throw new Error(`Müşteri kişisel verileri alınamadı: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error("Error in getByCustomerId:", error);
      throw error;
    }
  },

  // Create personal data for a customer
  async create(data: CustomerPersonalData) {
    console.log("Creating personal data for customer:", data.customer_id);
    try {
      const { data: newData, error } = await supabase
        .from('customer_personal_data')
        .insert([data])
        .select();

      if (error) {
        console.error("Error creating customer personal data:", error);
        throw new Error(`Müşteri kişisel verileri oluşturulamadı: ${error.message}`);
      }
      
      return newData?.[0];
    } catch (error: any) {
      console.error("Error in create:", error);
      throw error;
    }
  },

  // Update personal data for a customer
  async update(id: number, data: Partial<CustomerPersonalData>) {
    console.log("Updating personal data for id:", id);
    try {
      const { data: updatedData, error } = await supabase
        .from('customer_personal_data')
        .update(data)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating customer personal data:", error);
        throw new Error(`Müşteri kişisel verileri güncellenemedi: ${error.message}`);
      }
      
      return updatedData?.[0];
    } catch (error: any) {
      console.error("Error in update:", error);
      throw error;
    }
  },

  // Upsert personal data for a customer (create if not exists, update if exists)
  async upsert(data: CustomerPersonalData) {
    console.log("Upserting personal data for customer:", data.customer_id);
    try {
      // Check if record exists
      const existing = await this.getByCustomerId(data.customer_id);
      
      if (existing) {
        return await this.update(existing.id, data);
      } else {
        return await this.create(data);
      }
    } catch (error: any) {
      console.error("Error in upsert:", error);
      throw error;
    }
  }
};
