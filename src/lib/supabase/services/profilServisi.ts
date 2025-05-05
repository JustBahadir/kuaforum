
import { supabase } from '../client';
import { Profil } from '../types';

export const profilServisi = {
  getir: async (id: string): Promise<Profil> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  guncelle: async (id: string, profil: Partial<Profil>): Promise<Profil> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(profil)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  olustur: async (profil: Partial<Profil>): Promise<Profil> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profil])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Alias method for backward compatibility
  createProfile: async (profil: Partial<Profil>): Promise<Profil> => {
    return profilServisi.olustur(profil);
  }
};
