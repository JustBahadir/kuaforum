
import { supabase } from '../client';

export const customerServisi = {
  async getCustomerProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Customer profile fetch error:', error);
      return null;
    }
  },
  
  async updateCustomerProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Customer profile update error:', error);
      return null;
    }
  }
};
