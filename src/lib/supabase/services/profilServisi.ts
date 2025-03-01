import { supabase } from '../client';
import { Profile } from '../types';

export const profilServisi = {
  async getir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // Return basic profile from auth data as fallback
        if (error.code === '42P17') { // Infinite recursion in policy error
          return {
            id: user.id,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            role: 'customer'
          };
        }
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Exception in profile fetch:", error);
      // Return basic profile from auth data as fallback
      return {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: 'customer'
      };
    }
  },

  async guncelle(profile: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı girişi yapılmamış');

    try {
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
        
        // Update auth metadata as fallback when profile table update fails
        if (error.code === '42P17') { // Infinite recursion in policy error
          await supabase.auth.updateUser({
            data: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              phone: profile.phone,
              role: profile.role || 'customer'
            }
          });
          
          // Return constructed profile object
          return {
            id: user.id,
            ...updateData,
            created_at: new Date().toISOString()
          };
        }
        
        throw error;
      }
      return data;
    } catch (error: any) {
      // If it's not the specific policy error we know how to handle, rethrow
      if (error.code !== '42P17') {
        throw error;
      }
      
      console.error("Using fallback for profile update:", error);
      
      // Update auth metadata as fallback
      const { data } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: profile.role || 'customer'
        }
      });
      
      // Return constructed profile object
      return {
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role || 'customer',
        created_at: new Date().toISOString()
      };
    }
  },
  
  async getUserRole(userId: string) {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
      return data?.role;
    } catch (error) {
      console.error("Exception in getUserRole:", error);
      return null;
    }
  },
  
  async createOrUpdateProfile(userId: string, profileData: Partial<Profile>) {
    if (!userId) throw new Error('Kullanıcı ID bilgisi eksik');
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
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
    } catch (error) {
      console.error("Exception in createOrUpdateProfile:", error);
      throw error;
    }
  }
};
