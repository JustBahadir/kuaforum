
import { supabase } from '../client';

export interface CustomerPersonalData {
  id?: number;
  customer_id: string;
  birth_date: Date | string | null;
  anniversary_date: Date | string | null;
  horoscope: string | null;
  horoscope_description: string | null;
  children_names: string[];
  custom_notes: string | null;
  daily_horoscope_reading?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const customerPersonalDataService = {
  async getByCustomerId(customerId: string): Promise<CustomerPersonalData | null> {
    try {
      // Use numeric ID directly without trying to treat it as a UUID
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer personal data:', error);
      return null;
    }
  },

  async upsert(data: CustomerPersonalData): Promise<CustomerPersonalData | null> {
    try {
      // Check if record exists
      const { data: existingData } = await supabase
        .from('customer_personal_data')
        .select('id')
        .eq('customer_id', data.customer_id)
        .maybeSingle();

      let result;
      
      if (existingData?.id) {
        // Update
        const { data: updatedData, error } = await supabase
          .from('customer_personal_data')
          .update({
            birth_date: data.birth_date,
            anniversary_date: data.anniversary_date,
            horoscope: data.horoscope,
            horoscope_description: data.horoscope_description,
            children_names: data.children_names,
            custom_notes: data.custom_notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        result = updatedData;
      } else {
        // Insert
        const { data: newData, error } = await supabase
          .from('customer_personal_data')
          .insert([{
            customer_id: data.customer_id,
            birth_date: data.birth_date,
            anniversary_date: data.anniversary_date,
            horoscope: data.horoscope,
            horoscope_description: data.horoscope_description,
            children_names: data.children_names,
            custom_notes: data.custom_notes
          }])
          .select()
          .single();

        if (error) throw error;
        result = newData;
      }

      return result;
    } catch (error) {
      console.error('Error saving customer personal data:', error);
      throw error;
    }
  }
};
