
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
  spouse_name?: string | null;
  spouse_birthdate?: string | null;
}

export const customerPersonalDataService = {
  async getCustomerPersonalData(customerId: string | number): Promise<CustomerPersonalData | null> {
    try {
      console.log("Fetching personal data for customer:", customerId);
      
      // Always handle as string
      const customerIdStr = customerId.toString();
      
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerIdStr)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching customer personal data:", error);
        throw error;
      }
      
      console.log("Retrieved customer personal data:", data);
      return data;
    } catch (error) {
      console.error('Error getting customer personal data:', error);
      return null;
    }
  },
  
  async updateCustomerPersonalData(customerId: string | number, personalData: Partial<CustomerPersonalData>): Promise<void> {
    try {
      console.log("Updating personal data for customer:", customerId);
      console.log("Data to update:", personalData);
      
      // Always handle as string
      const customerIdStr = customerId.toString();
      
      // Check if record exists
      const { data: existingData } = await supabase
        .from('customer_personal_data')
        .select('id')
        .eq('customer_id', customerIdStr)
        .maybeSingle();
      
      // Check for empty children_names array
      const children_names = personalData.children_names || [];
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('customer_personal_data')
          .update({
            ...personalData,
            children_names: children_names,
            updated_at: new Date().toISOString()
          })
          .eq('customer_id', customerIdStr);
          
        if (error) {
          console.error("Error updating customer personal data:", error);
          throw error;
        }
        
        console.log("Successfully updated customer personal data");
      } else {
        // Create new record
        const { error } = await supabase
          .from('customer_personal_data')
          .insert({
            customer_id: customerIdStr,
            ...personalData,
            children_names: children_names,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error("Error inserting new customer personal data:", error);
          throw error;
        }
        
        console.log("Successfully created new customer personal data");
      }
    } catch (error) {
      console.error('Error updating customer personal data:', error);
      throw error;
    }
  },

  // Alias method that matches what CustomerDetails.tsx is trying to use
  async getByCustomerId(customerId: string | number): Promise<CustomerPersonalData | null> {
    return this.getCustomerPersonalData(customerId);
  },

  // Alias method that matches what CustomerDetails.tsx is trying to use
  async upsert(personalData: CustomerPersonalData): Promise<void> {
    return this.updateCustomerPersonalData(personalData.customer_id, personalData);
  }
};
