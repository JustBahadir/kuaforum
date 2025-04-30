
import { supabase } from '../client';
import { KategoriDto } from '../types';

export const kategoriServisi = {
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
        console.warn("No dukkanId found, returning empty categories list");
        return [];
      }

      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });

      if (error) throw error;
      console.log("Retrieved categories for shop ID:", dukkanId, "count:", data?.length);
      return data || [];
    } catch (error) {
      console.error("Kategori getirme hatası:", error);
      throw error;
    }
  },

  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Kategori getirme hatası:", error);
      throw error;
    }
  },

  async ekle(kategori: Omit<KategoriDto, 'id'>) {
    try {
      // Get current shop ID
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Add dukkan_id to the category
      const categoryToInsert = {
        ...kategori,
        dukkan_id: dukkanId
      };

      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert(categoryToInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Kategori ekleme hatası:", error);
      throw error;
    }
  },

  async guncelle(id: number, kategori: Partial<KategoriDto>) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Ensure we're only updating categories for this shop
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(kategori)
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Kategori güncelleme hatası:", error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const dukkanId = await this._getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının işletme bilgisi bulunamadı");
      }

      // Ensure we're only deleting categories for this shop
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Kategori silme hatası:", error);
      throw error;
    }
  }
};
