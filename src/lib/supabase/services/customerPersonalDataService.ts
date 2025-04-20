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
  
  // Customer beverage preferences
  beverage_preferences?: string[];
  beverage_notes?: string;
  
  // Hair type preferences
  hair_types?: string[];
  hair_structure?: string; // Düz, Dalgalı, Kıvırcık
  hair_condition?: string; // Kuru, Normal, Yağlı
  hair_thickness?: string; // İnce Telli, Kalın Telli
  
  // Dye preferences
  dye_preferences?: string[];
  root_dye_frequency?: string;
  bleach_tolerance?: boolean;
  // allergy_notes removed because column missing
  
  // Heat treatment preferences
  straightener_preference?: string;
  curling_preference?: string;
  heat_sensitive_hair?: boolean;
  heat_notes?: string;
  
  // Care preferences
  care_preferences?: string[];
  care_notes?: string;
  
  // Hair length & goal
  hair_length?: string;
  hair_goal?: string;
  hair_goal_notes?: string;
  
  // Brow/Mustache/Eyelash preferences
  brow_preference?: string;
  mustache_preference?: string;
  waxing_preference?: boolean;
  eyelash_preference?: boolean;
  face_preference_notes?: string;
  
  // Sensitivities
  sensitivities?: string[];
  sensitivity_notes?: string;
  
  // Stylist observations
  stylist_observations?: string;
}

export const customerPersonalDataService = {
  async getCustomerPersonalData(customerId: string | number): Promise<CustomerPersonalData | null> {
    try {
      console.log("Fetching personal data for customer:", customerId);
      
      let customerIdForQuery;
      if (typeof customerId === 'number' || /^\d+$/.test(String(customerId))) {
        customerIdForQuery = `00000000-0000-4000-a000-00000000${String(customerId).padStart(4, '0')}`;
        console.log("Formatted numeric ID to UUID:", customerIdForQuery);
      } else {
        customerIdForQuery = String(customerId).replace(/"/g, "");
      }
      
      console.log("Using customer ID for query:", customerIdForQuery);
      
      const { data, error } = await supabase
        .from('customer_personal_data')
        .select('*')
        .eq('customer_id', customerIdForQuery)
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
      
      let customerIdForUpdate;
      if (typeof customerId === 'number' || /^\d+$/.test(String(customerId))) {
        customerIdForUpdate = `00000000-0000-4000-a000-00000000${String(customerId).padStart(4, '0')}`;
        console.log("Formatted numeric ID to UUID:", customerIdForUpdate);
      } else {
        customerIdForUpdate = String(customerId).replace(/"/g, "");
      }
      
      console.log("Using customer ID for update:", customerIdForUpdate);
      
      const { data: existingData } = await supabase
        .from('customer_personal_data')
        .select('id')
        .eq('customer_id', customerIdForUpdate)
        .maybeSingle();
      
      const children_names = Array.isArray(personalData.children_names) ? personalData.children_names : [];
      console.log("Children names to update:", children_names);

      let hair_types = [...(personalData.hair_types || [])];
      
      if (personalData.hair_structure && !hair_types.includes(personalData.hair_structure)) {
        hair_types = [...hair_types.filter(t => !['Düz', 'Dalgalı', 'Kıvırcık'].includes(t)), personalData.hair_structure];
      }
      
      if (personalData.hair_condition && !hair_types.includes(personalData.hair_condition)) {
        hair_types = [...hair_types.filter(t => !['Kuru', 'Normal', 'Yağlı'].includes(t)), personalData.hair_condition];
      }
      
      if (personalData.hair_thickness && !hair_types.includes(personalData.hair_thickness)) {
        hair_types = [...hair_types.filter(t => !['İnce Telli', 'Kalın Telli'].includes(t)), personalData.hair_thickness];
      }
      
      // Remove allergy_notes field from dataToSave (it does not exist in the interface or DB)
      // So we omit allergy_notes from restData
      const {
        allergy_notes, // exclude
        ...restData
      } = personalData;
      
      const dataToSave = {
        ...restData,
        customer_id: customerIdForUpdate,
        children_names: children_names,
        hair_types: hair_types,
        updated_at: new Date().toISOString()
      };
      
      if (existingData) {
        const { error } = await supabase
          .from('customer_personal_data')
          .update(dataToSave)
          .eq('customer_id', customerIdForUpdate);
        
        if (error) {
          console.error("Error updating customer personal data:", error);
          throw error;
        }
        
        console.log("Successfully updated customer personal data");
      } else {
        const { error } = await supabase
          .from('customer_personal_data')
          .insert({
            customer_id: customerIdForUpdate,
            ...dataToSave,
            created_at: new Date().toISOString(),
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

  async getByCustomerId(customerId: string | number): Promise<CustomerPersonalData | null> {
    return this.getCustomerPersonalData(customerId);
  },

  async upsert(personalData: CustomerPersonalData): Promise<void> {
    return this.updateCustomerPersonalData(personalData.customer_id, personalData);
  }
};
