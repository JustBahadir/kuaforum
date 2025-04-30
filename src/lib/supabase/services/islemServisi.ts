
import { supabase } from '../client';
import { IslemDto } from '../types';

// Helper function to get current user's dukkan_id - shared with kategoriServisi
async function _getCurrentUserDukkanId() {
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
}

export const islemServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .order('islem_adi');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("İşlem getirme hatası:", error);
      throw error;
    }
  },

  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('id', id)
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
      if (!kategori_id) return [];
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategori_id)
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Kategori işlemleri getirme hatası:", error);
      throw error;
    }
  },

  async ekle(islem: Omit<IslemDto, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .insert(islem)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("İşlem ekleme hatası:", error);
      throw new Error(error.message);
    }
  },

  async guncelle(id: number, islem: Partial<IslemDto>) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(islem)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("İşlem güncelleme hatası:", error);
      throw new Error(error.message);
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("İşlem silme hatası:", error);
      throw new Error(error.message);
    }
  }
};
