
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
  },
  
  async getUserRole(userId: string) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    return data?.role;
  },
  
  async createOrUpdateProfile(userId: string, profileData: Partial<Profile>) {
    if (!userId) throw new Error('Kullanıcı ID bilgisi eksik');
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // Code for "no rows found"
      console.error("Error checking existing profile:", checkError);
      throw checkError;
    }
    
    const profile = {
      id: userId,
      first_name: profileData.first_name || existingProfile?.first_name || '',
      last_name: profileData.last_name || existingProfile?.last_name || '',
      phone: profileData.phone || existingProfile?.phone || '',
      occupation: profileData.occupation || existingProfile?.occupation || '',
      role: profileData.role || existingProfile?.role || 'customer'
    };
    
    // Use upsert to create or update profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();
      
    if (error) {
      console.error("Profile upsert error:", error);
      throw error;
    }
    
    return data;
  }
};
