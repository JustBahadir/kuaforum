
import { supabase } from '@/lib/supabase/client';

// Define the personelServisi object with its methods
export const personelServisi = {
  getirByAuthId: async function(authId: string) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel auth ID bilgisi getirme hatası:', error);
      throw error;
    }
  },
  
  // Add other common methods
  hepsiniGetir: async function(dukkanId?: number) {
    try {
      let query = supabase.from('personel').select('*');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel listesi getirme hatası:', error);
      return [];
    }
  },
  
  getir: async function(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel getirme hatası:', error);
      return null;
    }
  }
};
