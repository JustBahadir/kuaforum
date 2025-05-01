
import { supabase } from '../client';
import { dukkanServisi } from './dukkanServisi';

export const kategorilerServisi = {
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Check if user is an owner
      const { data: dukkanData } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanData?.id) return dukkanData.id;
      
      // Check if user is staff
      const { data: personelData } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personelData?.dukkan_id) return personelData.dukkan_id;
      
      // Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      return profileData?.dukkan_id || null;
    } catch (error) {
      console.error("Hata (dukkan_id):", error);
      return null;
    }
  },

  async hepsiniGetir(dukkanId = null) {
    try {
      let actualDukkanId = dukkanId;
      
      // If dukkanId is not provided, try to get current user's dukkan_id
      if (!actualDukkanId) {
        actualDukkanId = await this.getCurrentUserDukkanId();
      }
      
      if (!actualDukkanId) {
        console.warn("Kullanıcının dükkan bilgisi bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', actualDukkanId)
        .order('sira', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Kategorileri getirirken hata:", err);
      return [];
    }
  },

  async getir(id: number) {
    try {
      const dukkanId = await this.getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının dükkan bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('id', id)
        .eq('dukkan_id', dukkanId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`ID: ${id} kategori getirme hatası:`, err);
      throw err;
    }
  },

  async ekle(kategori: { kategori_adi: string; sira?: number; dukkan_id?: number }) {
    try {
      let dukkanId = kategori.dukkan_id;
      
      // If dukkan_id is not provided, try to get current user's dukkan_id
      if (!dukkanId) {
        dukkanId = await this.getCurrentUserDukkanId();
      }
      
      if (!dukkanId) {
        throw new Error("Kullanıcının dükkan bilgisi bulunamadı");
      }
      
      // Include dukkan_id in the category data
      const kategoriData = {
        ...kategori,
        dukkan_id: dukkanId,
      };
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert(kategoriData)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Kategori ekleme hatası:", err);
      throw err;
    }
  },

  async guncelle(id: number, updates: { kategori_adi?: string; sira?: number }) {
    try {
      const dukkanId = await this.getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının dükkan bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .eq('dukkan_id', dukkanId) // Ensure the category belongs to the user's dukkan
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error(`ID: ${id} kategori güncelleme hatası:`, err);
      throw err;
    }
  },

  async sil(id: number) {
    try {
      const dukkanId = await this.getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının dükkan bilgisi bulunamadı");
      }
      
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id)
        .eq('dukkan_id', dukkanId); // Ensure the category belongs to the user's dukkan
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`ID: ${id} kategori silme hatası:`, err);
      throw err;
    }
  },
  
  async sirayiGuncelle(kategoriler: { id: number; sira: number }[]) {
    try {
      const dukkanId = await this.getCurrentUserDukkanId();
      if (!dukkanId) {
        throw new Error("Kullanıcının dükkan bilgisi bulunamadı");
      }
      
      // Update each category's order
      const updates = kategoriler.map((kategori) => {
        return supabase
          .from('islem_kategorileri')
          .update({ sira: kategori.sira })
          .eq('id', kategori.id)
          .eq('dukkan_id', dukkanId); // Ensure the category belongs to the user's dukkan
      });
      
      await Promise.all(updates);
      return true;
    } catch (err) {
      console.error("Kategori sıralama hatası:", err);
      throw err;
    }
  }
};

// For backward compatibility
export const kategoriServisi = kategorilerServisi;
