
import { supabase } from '../client';
import { IslemDto } from '../types';

export const islemServisi = {
  async _getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Try to get dukkan_id from user metadata first
      const dukkanIdFromMeta = user?.user_metadata?.dukkan_id;
      if (dukkanIdFromMeta) return dukkanIdFromMeta;
      
      // If not in metadata, try profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileData?.dukkan_id) return profileData.dukkan_id;
      
      // Try personel table
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelData?.dukkan_id) return personelData.dukkan_id;
      
      // As fallback, try to get shop ID where user is owner
      const { data: shopData } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      return shopData?.id || null;
    } catch (error) {
      console.error("Error getting dukkan_id:", error);
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
        .select('*, kategori_id(id, kategori_adi)')
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("İşlem getirme hatası:", error);
      return [];
    }
  },

  async getir(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*, kategori_id(id, kategori_adi)')
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
      if (!dukkanId) {
        console.warn("No dukkanId found, returning empty category services list");
        return [];
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*, kategori_id(id, kategori_adi)')
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

  async ekle(islem: Omit<IslemDto, "id">) {
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
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("İşlem ekleme hatası:", error);
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
      console.error("İşlem güncelleme hatası:", error);
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
      console.error("İşlem silme hatası:", error);
      throw error;
    }
  }
};
