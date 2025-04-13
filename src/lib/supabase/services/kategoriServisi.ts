
import { supabase } from "../client";
import { Kategori } from "../types";

export const kategoriServisi = {
  async hepsiniGetir(): Promise<Kategori[]> {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .order('sira');
      
    if (error) throw error;
    return data || [];
  },
  
  async getir(id: number): Promise<Kategori> {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async ekle(kategori: Partial<Kategori>): Promise<Kategori> {
    try {
      // Get the max sira value
      const { data: maxSiraData, error: maxSiraError } = await supabase
        .from('islem_kategorileri')
        .select('sira')
        .order('sira', { ascending: false })
        .limit(1);
      
      if (maxSiraError) throw maxSiraError;
      
      const maxSira = maxSiraData && maxSiraData.length > 0 ? maxSiraData[0].sira || 0 : 0;
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([{
          ...kategori,
          sira: maxSira + 1
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, kategori: Partial<Kategori>): Promise<Kategori> {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(kategori)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  },
  
  async siraGuncelle(kategoriler: Kategori[]): Promise<Kategori[]> {
    try {
      // Update each category with its new position
      const updates = kategoriler.map((kategori, index) => ({
        id: kategori.id,
        sira: index
      }));
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .upsert(updates, { onConflict: 'id' })
        .select();
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori sıra güncelleme hatası:', error);
      throw error;
    }
  },
};
