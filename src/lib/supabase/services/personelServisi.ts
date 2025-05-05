
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  isletmeyeGoreGetir: async (isletmeKimlik: string): Promise<Personel[]> => {
    const { data, error } = await supabase
      .from('personeller')
      .select('*')
      .eq('isletme_id', isletmeKimlik);
      
    if (error) throw error;
    return data || [];
  },
  
  hepsiniGetir: async (): Promise<Personel[]> => {
    const { data, error } = await supabase
      .from('personeller')
      .select('*');
      
    if (error) throw error;
    return data || [];
  },
  
  getir: async (personelKimlik: string): Promise<Personel> => {
    const { data, error } = await supabase
      .from('personeller')
      .select('*')
      .eq('kimlik', personelKimlik)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  olustur: async (personel: Partial<Personel>): Promise<Personel> => {
    const { data, error } = await supabase
      .from('personeller')
      .insert([personel])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  guncelle: async (personelKimlik: string, personel: Partial<Personel>): Promise<Personel> => {
    const { data, error } = await supabase
      .from('personeller')
      .update(personel)
      .eq('kimlik', personelKimlik)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  sil: async (personelKimlik: string): Promise<void> => {
    const { error } = await supabase
      .from('personeller')
      .delete()
      .eq('kimlik', personelKimlik);
      
    if (error) throw error;
  },
  
  register: async (personelData: any): Promise<Personel> => {
    // Implementation for registering a new personnel
    const { data, error } = await supabase
      .from('personeller')
      .insert([personelData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
