
import { supabase } from '../client';
import { KategoriDto } from '../types';
import { isletmeServisi } from './dukkanServisi';

export const kategoriServisi = {
  async getCurrentDukkanId() {
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
  
  hepsiniGetir: async (dukkanId?: number) => {
    try {
      console.log("kategoriServisi.hepsiniGetir called with dukkanId:", dukkanId);
      
      let id = dukkanId;
      if (!id) {
        id = await kategoriServisi.getCurrentDukkanId();
        console.log("Fetched current dukkanId:", id);
      }
      
      if (!id) {
        console.error("No dukkan ID available");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', id)
        .order('sira');

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} categories`);
      return data || [];
    } catch (error) {
      console.error('Kategori listesi getirme hatası:', error);
      throw error;
    }
  },

  getir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori getirme hatası:', error);
      throw error;
    }
  },

  ekle: async (kategoriData: Partial<KategoriDto>) => {
    try {
      console.log("Adding category with data:", kategoriData);
      
      // Make sure we have a dukkan_id
      if (!kategoriData.dukkan_id) {
        const dukkanId = await kategoriServisi.getCurrentDukkanId();
        if (!dukkanId) {
          console.error("No dukkan ID available for adding category");
          throw new Error('İşletme bilgisi bulunamadı');
        }
        kategoriData.dukkan_id = dukkanId;
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([kategoriData])
        .select();

      if (error) {
        console.error("Error adding category:", error);
        throw error;
      }
      
      console.log("Category added:", data[0]);
      return data[0];
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, updates: Partial<KategoriDto>) => {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  },

  sirayiGuncelle: async (items: { id: number; sira: number }[]) => {
    try {
      // Update each item in sequence to avoid race conditions
      for (const item of items) {
        const { error } = await supabase
          .from('islem_kategorileri')
          .update({ sira: item.sira })
          .eq('id', item.id);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Kategori sıralaması güncelleme hatası:', error);
      throw error;
    }
  }
};
