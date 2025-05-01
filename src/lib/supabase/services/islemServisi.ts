
import { supabase } from '../client';

export const islemServisi = {
  async hepsiniGetir(dukkanId = null) {
    try {
      let query = supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id(id, kategori_adi)
        `)
        .order('sira', { ascending: true });
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
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
  }
};
