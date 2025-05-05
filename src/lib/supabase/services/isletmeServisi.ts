
import { supabase } from '../client';
import { Isletme } from '../types';

export const isletmeServisi = {
  getir: async (isletmeKimlik: string): Promise<Isletme> => {
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('kimlik', isletmeKimlik)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getirByKod: async (isletmeKodu: string): Promise<Isletme> => {
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('kod', isletmeKodu)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  kullaniciIsletmesiniGetir: async (): Promise<Isletme | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('isletmeler')
        .select('*')
        .eq('sahip_kimlik', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Kullanıcı işletmesi getirme hatası:', error);
      return null;
    }
  },

  // For backward compatibility
  kullaniciDukkaniniGetir: async (): Promise<Isletme | null> => {
    return isletmeServisi.kullaniciIsletmesiniGetir();
  },
  
  olustur: async (isletme: Partial<Isletme>): Promise<Isletme> => {
    const { data, error } = await supabase
      .from('isletmeler')
      .insert([isletme])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  guncelle: async (isletmeKimlik: string, isletme: Partial<Isletme>): Promise<Isletme> => {
    const { data, error } = await supabase
      .from('isletmeler')
      .update(isletme)
      .eq('kimlik', isletmeKimlik)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  sil: async (isletmeKimlik: string): Promise<void> => {
    const { error } = await supabase
      .from('isletmeler')
      .delete()
      .eq('kimlik', isletmeKimlik);
      
    if (error) throw error;
  },
  
  // Backward compatibility methods
  getirById: async (isletmeId: string | number): Promise<Isletme> => {
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('id', isletmeId)
      .single();
      
    if (error) throw error;
    return data;
  }
};
