
import { supabase } from '@/lib/supabase/client';
import { authService } from '@/lib/auth/authService';

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

  // Get current user's shop
  kullaniciDukkaniniGetir: async function() {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return null;
      
      return this.kullanicininIsletmesi(user.id);
    } catch (error) {
      console.error('Kullanıcı dükkanı getirme hatası:', error);
      return null;
    }
  },

  // Get shop by code
  getirByKod: async function(kod: string) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('kod', kod)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kod ile dükkan getirme hatası:', error);
      return null;
    }
  },

  personelAuthIdIsletmesi: async function(authId: string) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('dukkan_id, dukkanlar:dukkan_id(*)')
        .eq('auth_id', authId)
        .single();
      
      if (error) throw error;
      return data?.dukkanlar;
    } catch (error) {
      console.error('Personel işletmesi getirme hatası:', error);
      return null;
    }
  },

  // Add missing guncelle method
  guncelle: async function(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Dükkan güncelleme hatası:', error);
      throw error;
    }
  }
};

export const isletmeServisi = dukkanServisi;
