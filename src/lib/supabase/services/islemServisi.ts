
import { supabase } from '../client';
import { Hizmet } from '../types';

export const islemServisi = {
  kategoriyeGoreGetir: async (kategoriKimlik: string): Promise<Hizmet[]> => {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .eq('kategori_kimlik', kategoriKimlik)
      .order('siralama', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  isletmeyeGoreGetir: async (isletmeKimlik: string): Promise<Hizmet[]> => {
    const { data, error } = await supabase
      .from('islemler')
      .select('*')
      .eq('isletme_kimlik', isletmeKimlik)
      .order('siralama', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  hepsiniGetir: async (): Promise<Hizmet[]> => {
    const { data, error } = await supabase
      .from('islemler')
      .select('*');
      
    if (error) throw error;
    return data || [];
  },
  
  olustur: async (islem: Partial<Hizmet>): Promise<Hizmet> => {
    const { data, error } = await supabase
      .from('islemler')
      .insert([islem])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  guncelle: async (islemKimlik: string, islem: Partial<Hizmet>): Promise<Hizmet> => {
    const { data, error } = await supabase
      .from('islemler')
      .update(islem)
      .eq('kimlik', islemKimlik)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  sil: async (islemKimlik: string): Promise<void> => {
    const { error } = await supabase
      .from('islemler')
      .delete()
      .eq('kimlik', islemKimlik);
      
    if (error) throw error;
  },

  // Add missing sirayiGuncelle function
  sirayiGuncelle: async (islemId: string, yeniSira: number): Promise<void> => {
    const { error } = await supabase
      .from('islemler')
      .update({ siralama: yeniSira })
      .eq('kimlik', islemId);

    if (error) throw error;
  }
};

// Compatibility aliases
export const hizmetServisi = islemServisi;
