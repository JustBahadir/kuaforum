
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
    // Get the max sira value
    const { data: maxSiraData, error: maxSiraError } = await supabase
      .from('islem_kategorileri')
      .select('sira')
      .order('sira', { ascending: false })
      .limit(1);
    
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
  },
  
  async guncelle(id: number, kategori: Partial<Kategori>): Promise<Kategori> {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .update(kategori)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  async sil(id: number): Promise<void> {
    const { error } = await supabase
      .from('islem_kategorileri')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
  
  async siraGuncelle(kategoriler: Kategori[]): Promise<void> {
    // Update each category with its new position
    const updates = kategoriler.map((kategori, index) => {
      return supabase
        .from('islem_kategorileri')
        .update({ sira: index })
        .eq('id', kategori.id);
    });
    
    // Wait for all updates to complete
    await Promise.all(updates);
  },
};
