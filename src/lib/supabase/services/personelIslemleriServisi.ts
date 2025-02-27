
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  async hepsiniGetir(personelId?: number, musteriId?: string) {
    const query = supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        musteri:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (personelId) {
      query.eq('personel_id', personelId);
    }
    
    if (musteriId) {
      query.eq('musteri_id', musteriId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async ekle(islem: Omit<PersonelIslemi, 'id' | 'created_at' | 'islem' | 'musteri'>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islem])
      .select(`
        *,
        islem:islemler(*),
        musteri:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, islem: Partial<PersonelIslemi>) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .update(islem)
      .eq('id', id)
      .select(`
        *,
        islem:islemler(*),
        musteri:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
