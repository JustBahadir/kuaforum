
import { supabase } from '../client';

export const dukkanServisi = {
  getirById: async (id: number) => {
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

  getirByKod: async (kod: string) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('kod', kod)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Dükkan kod ile getirme hatası:', error);
      throw error;
    }
  },

  kullaniciDukkaniniGetir: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kullanıcı dükkanını getirme hatası:', error);
      throw error;
    }
  },

  hepsiniGetir: async () => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .order('ad');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tüm dükkanları getirme hatası:', error);
      throw error;
    }
  },

  // Add missing functions
  kullanicininIsletmesi: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kullanıcının işletmesini getirme hatası:', error);
      throw error;
    }
  },

  personelAuthIdIsletmesi: async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .select('dukkan_id, dukkanlar(*)')
        .eq('auth_id', authId)
        .single();

      if (error) throw error;
      return data?.dukkanlar;
    } catch (error) {
      console.error('Personel işletmesini getirme hatası:', error);
      throw error;
    }
  }
};
