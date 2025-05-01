
import { supabase } from '@/lib/supabase/client';

// Define the dukkanServisi object with its methods
export const dukkanServisi = {
  getirById: async function(id: number) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Dükkan getirme hatası:', error);
      throw error;
    }
  },
  
  // Add other existing methods
  kullanicininIsletmesi: async function(userId: string) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('sahibi_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kullanıcının işletmesi getirme hatası:', error);
      return null;
    }
  },
};

// Create an alias for backward compatibility
export const isletmeServisi = dukkanServisi;
