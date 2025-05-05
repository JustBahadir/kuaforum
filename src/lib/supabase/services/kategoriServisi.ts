
import { supabase } from '../client';
import { IslemKategorisi } from '../types';

export const kategoriServisi = {
  isletmeyeGoreGetir: async (isletmeKimlik: string): Promise<IslemKategorisi[]> => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('isletme_id', isletmeKimlik)
      .order('sira', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  hepsiniGetir: async (): Promise<IslemKategorisi[]> => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*');
      
    if (error) throw error;
    return data || [];
  },
  
  olustur: async (kategori: Partial<IslemKategorisi>): Promise<IslemKategorisi> => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .insert([kategori])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  guncelle: async (kategoriKimlik: string, kategori: Partial<IslemKategorisi>): Promise<IslemKategorisi> => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .update(kategori)
      .eq('kimlik', kategoriKimlik)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  sil: async (kategoriKimlik: string): Promise<void> => {
    const { error } = await supabase
      .from('islem_kategorileri')
      .delete()
      .eq('kimlik', kategoriKimlik);
      
    if (error) throw error;
  }
};
