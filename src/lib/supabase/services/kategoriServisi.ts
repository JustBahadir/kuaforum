
import { supabase } from '../client';
import { Kategori } from '../types';

export const kategoriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .order('sira');

    if (error) throw error;
    return data || [];
  },

  async ekle(kategori: { kategori_adi: string }) {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .insert([{
        kategori_adi: kategori.kategori_adi,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, kategori: { kategori_adi: string }) {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .update({
        kategori_adi: kategori.kategori_adi,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('islem_kategorileri')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async siraGuncelle(kategoriler: Kategori[]) {
    const updates = kategoriler.map((kategori, index) => ({
      id: kategori.id,
      sira: index
    }));
    
    const { error } = await supabase
      .from('islem_kategorileri')
      .upsert(updates);
      
    if (error) throw error;
  }
};
