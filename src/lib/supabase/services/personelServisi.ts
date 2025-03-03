
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel')
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .order('ad_soyad');

    if (error) throw error;
    return data || [];
  },

  async ekle(personel: Omit<Personel, 'id' | 'created_at' | 'dukkan'>) {
    const { data, error } = await supabase
      .from('personel')
      .insert([personel])
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, personel: Partial<Omit<Personel, 'dukkan'>>) {
    const { data, error } = await supabase
      .from('personel')
      .update(personel)
      .eq('id', id)
      .select(`
        *,
        dukkan:dukkanlar(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error: islemSilmeHatasi } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('personel_id', id);

    if (islemSilmeHatasi) throw islemSilmeHatasi;

    const { error } = await supabase
      .from('personel')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
