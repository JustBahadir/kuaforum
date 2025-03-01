
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

    // Make sure we're only updating fields that exist in the profiles table
    const updateData = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      occupation: profile.occupation,
      role: profile.role
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      throw error;
    }
    return data;
  }
};
