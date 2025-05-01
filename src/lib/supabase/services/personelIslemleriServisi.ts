
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  personelIslemleriniGetir: async (personelId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id (islem_adi),
          musteri:musteri_id (first_name, last_name)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemlerini getirme hatası:', error);
      throw error;
    }
  },

  musteriIslemleriniGetir: async (musteriId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id (islem_adi),
          personel:personel_id (ad_soyad, avatar_url)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemlerini getirme hatası:', error);
      throw error;
    }
  },

  hepsiniGetir: async (dukkanId?: number) => {
    try {
      let query = supabase
        .from('personel_islemleri')
        .select(`
          *,
          islem:islem_id (islem_adi),
          musteri:musteri_id (first_name, last_name),
          personel:personel_id (ad_soyad, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (dukkanId) {
        query = query.eq('personel.dukkan_id', dukkanId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemlerini getirme hatası:', error);
      throw error;
    }
  },

  islemEkle: async (islemVerileri: any) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islemVerileri])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  islemSil: async (islemId: number) => {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', islemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  },

  getCurrentDukkanId: async () => {
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
          .eq('sahibi_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.id;
      } else if (role === 'staff') {
        // Staff user - get dukkan through personeller
        const { data, error } = await supabase
          .from('personel')
          .select('dukkan_id')
          .eq('auth_id', user.id)
          .single();
          
        if (error) throw error;
        return data?.dukkan_id;
      }
      
      // Try to get from profiles as last resort
      const { data, error } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data?.dukkan_id;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      return null;
    }
  },
};

// This is for backward compatibility with code that might still use this name
export const personelIslemServisi = personelIslemleriServisi;
