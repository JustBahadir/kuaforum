
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir() {
    try {
      // Get the current user's dukkan_id from metadata
      const { data: { user } } = await supabase.auth.getUser();
      const dukkanId = user?.user_metadata?.dukkan_id;

      if (!dukkanId) {
        console.warn("User does not have a dukkan_id in metadata");
        return [];
      }

      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('ad_soyad');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Personel getirme hatası:", error);
      return [];
    }
  },

  async getirById(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Personel getirme hatası:", error);
      return null;
    }
  },
  
  async getirByAuthId(authId: string) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error("Personel (auth_id) getirme hatası:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Personel (auth_id) getirme hatası:", error);
      return null;
    }
  },

  async ekle(personel: any) {
    try {
      // Ensure dukkan_id is included
      if (!personel.dukkan_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.dukkan_id) {
          personel.dukkan_id = user.user_metadata.dukkan_id;
        } else {
          throw new Error("Dükkan bilgisi eksik");
        }
      }

      const { data, error } = await supabase
        .from('personel')
        .insert(personel)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Personel ekleme hatası:", error);
      throw new Error(error?.message || "Personel eklenirken bir hata oluştu");
    }
  },

  async guncelle(id: number, personel: Partial<Personel>) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .update(personel)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Personel güncelleme hatası:", error);
      throw new Error(error?.message || "Personel güncellenirken bir hata oluştu");
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Personel silme hatası:", error);
      throw new Error(error?.message || "Personel silinirken bir hata oluştu");
    }
  }
};
