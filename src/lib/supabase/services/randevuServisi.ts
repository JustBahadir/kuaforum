
import { supabase } from '../client';

export const randevuServisi = {
  async _getCurrentUserDukkanId() {
    try {
      // Get the current user auth data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // First try to get it from user metadata
      if (user.user_metadata?.dukkan_id) {
        return user.user_metadata.dukkan_id;
      }
      
      // Try to get it from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profile?.dukkan_id) {
        return profile.dukkan_id;
      }
      
      // Try to get it from personel table
      const { data: personel } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
        
      if (personel?.dukkan_id) {
        return personel.dukkan_id;
      }
      
      // If admin, try to get the shop they own
      if (user.user_metadata?.role === 'admin') {
        const { data: dukkan } = await supabase
          .from('dukkanlar')
          .select('id')
          .eq('sahibi_id', user.id)
          .maybeSingle();
          
        if (dukkan?.id) {
          return dukkan.id;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting current user's dukkan_id:", error);
      return null;
    }
  },
  
  async hepsiniGetir() {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        console.warn("No dukkanId found, returning empty appointments list");
        return [];
      }

      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) throw error;
      console.log("Retrieved appointments for shop ID:", dukkanId, "count:", data?.length);
      return data || [];
    } catch (error) {
      console.error("Randevu getirme hatası:", error);
      throw error;
    }
  },

  async getir(id) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Randevu getirme hatası:", error);
      throw error;
    }
  },
  
  async musteriRandevulari(musteriId) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Müşteri randevu getirme hatası:", error);
      return [];
    }
  },

  async ekle(randevu) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert(randevu)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Randevu ekleme hatası:", error);
      throw error;
    }
  },

  async guncelle(id, updates) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Randevu güncelleme hatası:", error);
      throw error;
    }
  },
  
  async durumGuncelle(id, yeniDurum) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum: yeniDurum })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Randevu durum güncelleme hatası:", error);
      throw error;
    }
  },

  async sil(id) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Randevu silme hatası:", error);
      throw error;
    }
  },

  // Add missing methods for: dukkanRandevulariniGetir, kendiRandevulariniGetir

  async dukkanRandevulariniGetir(dukkanId) {
    try {
      if (!dukkanId) {
        dukkanId = await this._getCurrentUserDukkanId();
        if (!dukkanId) {
          console.warn("No dukkanId found, returning empty appointments list");
          return [];
        }
      }

      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          personel:personel_id (ad_soyad),
          musteri:musteri_id (first_name, last_name)
        `)
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Dükkan randevuları getirme hatası:", error);
      throw error;
    }
  },

  async kendiRandevulariniGetir() {
    try {
      // Get current user's id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          personel:personel_id (ad_soyad),
          musteri:musteri_id (first_name, last_name)
        `)
        .eq('customer_id', user.id)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Kendi randevularını getirme hatası:", error);
      return [];
    }
  }
};
