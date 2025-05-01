
import { supabase } from '../client';

export const randevuServisi = {
  // Add or update this method to match the expected signature
  randevuOlustur: async (randevuVerisi: Partial<any>) => {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert(randevuVerisi)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },

  randevuGuncelle: async (id: number, updates: Partial<any>) => {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  },

  randevuSil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },

  randevuGetir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu getirme hatası:', error);
      throw error;
    }
  },

  dukkanRandevulariniGetir: async (dukkanId: string | number) => {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id(*),
          personel:personel_id(*),
          islem:islem_id(*)
        `)
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Dükkan randevularını getirme hatası:', error);
      throw error;
    }
  },

  kendiRandevulariniGetir: async (musteriId: string | number) => {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          dukkan:dukkan_id(*),
          personel:personel_id(*),
          islem:islem_id(*)
        `)
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kendi randevularını getirme hatası:', error);
      throw error;
    }
  },

  // Additional method for appointment creation compatibility
  ekle: async (randevuVerisi: Partial<any>) => {
    return randevuServisi.randevuOlustur(randevuVerisi);
  },

  // Add this method for getting current user's dukkan ID
  getCurrentUserDukkanId: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');
      
      // Check if user is admin
      const role = user.user_metadata?.role;
      
      if (role === 'admin') {
        // Admin user - get dukkan by user_id
        const { data, error } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personeller')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.dukkan_id;
      }
      
      return null;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      return null;
    }
  }
};
