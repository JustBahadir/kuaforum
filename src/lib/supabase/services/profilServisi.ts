
import { supabase } from '../client';
import { Profil } from '../types';

export const profilServisi = {
  async getir(id: string): Promise<Profil | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Profil;
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      return null;
    }
  },
  
  async guncelle(id: string, profil: Partial<Profil>): Promise<Profil | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profil)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Profil;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return null;
    }
  },
  
  async olustur(profil: Partial<Profil>): Promise<Profil | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profil)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Profil;
    } catch (error) {
      console.error('Profil oluşturma hatası:', error);
      return null;
    }
  }
};
