
import { supabase } from '../client';

export interface CustomerPersonalData {
  id?: number;
  customer_id: string;
  birth_date?: string | null;
  horoscope?: string | null;
  horoscope_description?: string | null;
  anniversary_date?: string | null;
  children_names: string[];
  custom_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  daily_horoscope_reading?: string | null;
}

export const customerPersonalDataService = {
  async getCustomerPersonalData(customerId: string): Promise<CustomerPersonalData | null> {
    try {
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching customer personal data:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting customer personal data:', error);
      return null;
    }
  },
  
  async updateCustomerPersonalData(customerId: string, personalData: Partial<CustomerPersonalData>): Promise<void> {
    try {
      // Check if record exists
      const { data: existingData } = await supabase
        .from('customer_personal_data')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('customer_personal_data')
          .update(personalData)
          .eq('customer_id', customerId);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('customer_personal_data')
          .insert({
            customer_id: customerId,
            ...personalData
          });
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating customer personal data:', error);
      throw error;
    }
  },

  // Alias method that matches what CustomerDetails.tsx is trying to use
  async getByCustomerId(customerId: string): Promise<CustomerPersonalData | null> {
    return this.getCustomerPersonalData(customerId);
  },

  // Alias method that matches what CustomerDetails.tsx is trying to use
  async upsert(personalData: CustomerPersonalData): Promise<void> {
    return this.updateCustomerPersonalData(personalData.customer_id, personalData);
  }
};
