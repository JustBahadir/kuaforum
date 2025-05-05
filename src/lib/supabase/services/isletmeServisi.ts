
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
      .eq('isletme_kodu', isletmeKodu)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  kullaniciIsletmesiniGetir: async (): Promise<Isletme> => {
    // Get the current user's business
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Oturum açmış kullanıcı bulunamadı');
    
    const { data, error } = await supabase
      .from('isletmeler')
      .select('*')
      .eq('sahip_kimlik', user.id)
      .single();
      
    if (error) throw error;
    return data;
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
  
  // For backward compatibility
  getirById: async (isletmeId: string): Promise<Isletme> => {
    return isletmeServisi.getir(isletmeId);
  },
};

// For backward compatibility
export const dukkanServisi = isletmeServisi;
