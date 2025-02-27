
import { supabase } from '../client';
import { Profile } from '../types';

export const profilServisi = {
  async getir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(profile: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı girişi yapılmamış');

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
