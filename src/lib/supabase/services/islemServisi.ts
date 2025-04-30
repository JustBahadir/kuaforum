
import { supabase } from '../client';
import { IslemDto } from '../types';

export const islemServisi = {
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
      
      console.warn("Could not determine dukkan_id for current user");
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
        console.warn("No dukkanId found, returning empty services list");
        return [];
      }

      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });

      if (error) throw error;
      console.log("Retrieved services for shop ID:", dukkanId, "count:", data?.length);
      return data || [];
    } catch (error) {
      console.error("İşlem getirme hatası:", error);
      return [];
    }
  },

  async getir(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("İşlem getirme hatası:", error);
      throw error;
    }
  },

  async kategoriIslemleriGetir(kategori_id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategori_id)
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Kategori işlemleri getirme hatası:", error);
      return [];
    }
  },

  async ekle(islem: Omit<IslemDto, 'id'>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Add dukkan_id to the islem
      const islemToInsert = {
        ...islem,
        dukkan_id: dukkanId
      };

      const { data, error } = await supabase
        .from('islemler')
        .insert(islemToInsert)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("İşlem eklenirken hata:", error);
      throw error;
    }
  },

  async guncelle(id: number, islem: Partial<IslemDto>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Ensure we're only updating islemler for this shop
      const { data, error } = await supabase
        .from('islemler')
        .update(islem)
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("İşlem güncellenirken hata:", error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Ensure we're only deleting islemler for this shop
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("İşlem silinirken hata:", error);
      throw error;
    }
  }
};
