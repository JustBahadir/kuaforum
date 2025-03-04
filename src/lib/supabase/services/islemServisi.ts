
import { supabase } from '../client';
import { Islem } from '../types';

export const islemServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .order('sira', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async islemEkle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .insert([islem])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    return this.islemEkle(islem);
  },

  async islemGuncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    const { data, error } = await supabase
      .from('islemler')
      .update(islem)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    return this.islemGuncelle(id, islem);
  },

  async islemSil(id: number) {
    const { error } = await supabase
      .from('islemler')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async sil(id: number) {
    return this.islemSil(id);
  },

  async siraGuncelle(islemler: Islem[]) {
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
