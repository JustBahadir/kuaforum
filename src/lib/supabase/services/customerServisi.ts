
import { supabase } from '../client';

export const customerServisi = {
  async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Kullanıcı oturum açmamış');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async updateUserProfile(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Kullanıcı oturum açmamış');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select();
      
    if (error) throw error;
    return data;
  },
  
  async getPreferences(customerId?: string) {
    let userId = customerId;
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturum açmamış');
      userId = user.id;
    }
    
    const { data, error } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('customer_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  },
  
  async updatePreferences(updates: any, customerId?: string) {
    let userId = customerId;
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturum açmamış');
      userId = user.id;
    }
    
    // Check if preferences exist
    const preferences = await this.getPreferences(userId);
    
    if (preferences) {
      // Update
      const { data, error } = await supabase
        .from('customer_preferences')
        .update({ ...updates, customer_id: userId })
        .eq('customer_id', userId)
        .select();
        
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('customer_preferences')
        .insert([{ ...updates, customer_id: userId }])
        .select();
        
      if (error) throw error;
      return data;
    }
  }
};
