
import { supabase } from '../client';
import { kategorilerServisi } from './kategoriServisi';

export const islemServisi = {
  async hepsiniGetir(dukkanId = null) {
    try {
      let actualDukkanId = dukkanId;
      
      // If dukkanId is not provided, try to get current user's dukkan_id
      if (!actualDukkanId) {
        actualDukkanId = await kategorilerServisi.getCurrentUserDukkanId();
      }
      
      let query = supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id(id, kategori_adi)
        `)
        .order('sira', { ascending: true });
      
      if (actualDukkanId) {
        query = query.eq('dukkan_id', actualDukkanId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("İşlemleri getirirken hata:", err);
      throw err;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id(id, kategori_adi)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`ID: ${id} işlem getirme hatası:`, err);
      throw err;
    }
  },
  
  async ekle(islem: any) {
    try {
      // Ensure we have all required fields
      if (!islem.islem_adi || islem.fiyat === undefined) {
        throw new Error("İşlem adı ve fiyat zorunludur");
      }
      
      // If dukkan_id is not set, try to get current user's dukkan_id
      if (!islem.dukkan_id) {
        islem.dukkan_id = await kategorilerServisi.getCurrentUserDukkanId();
      }
      
      if (!islem.dukkan_id) {
        throw new Error("İşletme bilgisi bulunamadı");
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .insert([islem])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("İşlem ekleme hatası:", err);
      throw err;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error(`ID: ${id} işlem güncelleme hatası:`, err);
      throw err;
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
    } catch (err) {
      console.error(`ID: ${id} işlem silme hatası:`, err);
      throw err;
    }
  },
  
  async siralamaGuncelle(islemler: { id: number; sira: number }[]) {
    try {
      // Batch update sira values for all islemler
      const updates = islemler.map(islem => {
        return supabase
          .from('islemler')
          .update({ sira: islem.sira })
          .eq('id', islem.id);
      });
      
      await Promise.all(updates);
      return true;
    } catch (err) {
      console.error("İşlem sıralama hatası:", err);
      throw err;
    }
  },
  
  async kategoriyeGoreGetir(kategoriId: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id(id, kategori_adi)
        `)
        .eq('kategori_id', kategoriId)
        .order('sira', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Kategori ID: ${kategoriId} için işlemleri getirirken hata:`, err);
      throw err;
    }
  },
  
  // New method to get services by shop ID
  async dukkanIslemleriniGetir(dukkanId: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id(id, kategori_adi)
        `)
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Dükkan ID: ${dukkanId} için işlemleri getirirken hata:`, err);
      throw err;
    }
  },
  
  // Add a method to get services by category for a specific shop
  async kategoriVeDukkanaGoreGetir(kategoriId: number, dukkanId: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id(id, kategori_adi)
        `)
        .eq('kategori_id', kategoriId)
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Kategori ID: ${kategoriId}, Dükkan ID: ${dukkanId} için işlemleri getirirken hata:`, err);
      throw err;
    }
  }
};
