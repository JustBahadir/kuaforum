
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
  },

  // New method to get profile by role
  getirByRole: async (role: string): Promise<Profil[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
      
    if (error) throw error;
    return data || [];
  },

  // New method to check if a profile exists
  exists: async (id: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};
