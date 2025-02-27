
import { supabase } from '../client';

export const islemServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .order('sira');

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .insert([{
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan,
        kategori_id: islem.kategori_id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number; kategori_id: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .update({
        islem_adi: islem.islem_adi.toUpperCase(),
        fiyat: islem.fiyat,
        puan: islem.puan,
        kategori_id: islem.kategori_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('islemler')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async siraGuncelle(islemler: any[]) {
    const updates = islemler.map((islem, index) => ({
      id: islem.id,
      sira: index
    }));
    
    const { error } = await supabase
      .from('islemler')
      .upsert(updates);
      
    if (error) throw error;
  }
};
