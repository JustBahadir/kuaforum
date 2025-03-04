
import { supabase } from "../client";
import { Kategori, Islem } from "../types";

export const siralamaServisi = {
  async kategoriSiraGuncelle(kategoriler: Kategori[]): Promise<Kategori[]> {
    // Update each category with its new position
    const updates = kategoriler.map((kategori, index) => ({
      id: kategori.id,
      sira: index
    }));
    
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .upsert(updates)
      .select();
      
    if (error) throw error;
    return data || [];
  },
  
  async islemSiraGuncelle(islemler: Islem[]): Promise<Islem[]> {
    // Update each item with its new position
    const updates = islemler.map((islem, index) => ({
      id: islem.id,
      sira: index
    }));
    
    const { data, error } = await supabase
      .from('islemler')
      .upsert(updates)
      .select();
      
    if (error) throw error;
    return data || [];
  }
};
