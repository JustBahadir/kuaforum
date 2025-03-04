
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  async personelIslemleriGetir(personelId: number) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .eq('personel_id', personelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        islem:islemler(*),
        personel:personel(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  
  async ekle(islem: Omit<PersonelIslemi, "id" | "created_at">) {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .insert([islem])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
