
import { supabase } from "../client";
import { Kategori, Islem } from "../types";

export const siralamaServisi = {
  async kategoriSiraGuncelle(kategoriler: Kategori[]): Promise<Kategori[]> {
    // Update each category with its new position
    const updates = kategoriler.map((kategori, index) => ({
      id: kategori.id,
      sira: index,
      kategori_adi: kategori.kategori_adi // Include kategori_adi to avoid null constraint error
    }));
    
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .upsert(updates, { onConflict: 'id' })
        .select();
        
      if (error) {
        console.error('Kategori sıra güncelleme hatası (detaylı):', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Kategori sıra güncelleme hatası:', error);
      throw error;
    }
  },
  
  async islemSiraGuncelle(islemler: Islem[]): Promise<Islem[]> {
    // Update each item with its new position
    const updates = islemler.map((islem, index) => ({
      id: islem.id,
      sira: index,
      islem_adi: islem.islem_adi, // Include islem_adi to avoid null constraint error
      fiyat: islem.fiyat, // Include fiyat to avoid potential null constraint errors
      puan: islem.puan // Include puan to avoid potential null constraint errors
    }));
    
    try {
      const { data, error } = await supabase
        .from('islemler')
        .upsert(updates, { onConflict: 'id' })
        .select();
        
      if (error) {
        console.error('İşlem sıra güncelleme hatası (detaylı):', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('İşlem sıra güncelleme hatası:', error);
      throw error;
    }
  }
};
