import { supabase } from '../../client';
import { Profile } from '../../types';
import { ProfileUpdateData } from './profileTypes';
import { createProfileViaRPC } from './createProfile';
import { handleStaffRecordSync } from './staffProfileSync';

/**
 * Updates a user's profile in the database
 */
export async function updateProfile(profile: ProfileUpdateData): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Kullanıcı girişi yapılmamış');

  try {
    // Make sure we're only updating fields that exist in the profiles table
    const updateData = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      role: profile.role
    };

    // Also update the auth metadata to keep it in sync
    await supabase.auth.updateUser({
      data: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role || 'customer'
      }
    });

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      
      // Try creating the profile if update fails
      try {
        const { data: createData, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...updateData
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Profile creation error:", createError);
          throw createError;
        }
        
        // If staff role, sync with personnel record
        if (profile.role === 'staff' || createData.role === 'staff') {
          await handleStaffRecordSync(user.id, createData);
        }
        
        return createData;
      } catch (createErr) {
        console.error("Profile creation exception:", createErr);
        
        // Return constructed profile object as fallback
        return {
          id: user.id,
          ...updateData,
          created_at: new Date().toISOString()
        };
      }
    }
    
    // If staff role, sync with personnel record
    if (profile.role === 'staff' || data.role === 'staff') {
      await handleStaffRecordSync(user.id, data);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in profile update:", error);
    
    // Return constructed profile object as fallback
    return {
      id: user.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      role: profile.role || 'customer',
      created_at: new Date().toISOString()
    };
  }
}

/**
 * Create or update a profile for a specific user ID
 */
export async function createOrUpdateProfile(userId: string, profileData: ProfileUpdateData): Promise<Profile> {
  if (!userId) throw new Error('Kullanıcı ID bilgisi eksik');
  
  try {
    // First try to get the existing profile, if any
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    // Update auth metadata first as this won't be affected by RLS
    try {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          role: profileData.role || 'customer'
        }
      });
    } catch (adminError) {
      console.error("Admin user update error:", adminError);
      
      // Try standard metadata update as fallback
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user?.id === userId) {
          await supabase.auth.updateUser({
            data: {
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone,
              role: profileData.role || 'customer'
            }
          });
        }
      } catch (updateError) {
        console.error("User metadata update error:", updateError);
      }
    }
    
    // Construct the profile data
    const profile = {
      id: userId,
      first_name: profileData.first_name || existingProfile?.first_name || '',
      last_name: profileData.last_name || existingProfile?.last_name || '',
      phone: profileData.phone || existingProfile?.phone || '',
      role: profileData.role || existingProfile?.role || 'customer'
    };
    
    // Try to update profile with RPC call first to bypass RLS
    try {
      await createProfileViaRPC({
        user_id: userId,
        user_first_name: profile.first_name,
        user_last_name: profile.last_name,
        user_phone: profile.phone,
        user_role: profile.role
      });
    } catch (rpcError) {
      console.error("RPC error:", rpcError);
      
      // Try standard upsert as fallback
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(profile)
          .select()
          .single();
          
        if (error) {
          console.error("Profile upsert error:", error);
          throw error;
        }
      } catch (upsertError) {
        console.error("Profile upsert exception:", upsertError);
      }
    }
    
    // If staff role, sync with personnel record
    if (profile.role === 'staff') {
      await handleStaffRecordSync(userId, profile);
    }
    
    // Re-fetch the profile to return the current state
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    return updatedProfile || profile;
  } catch (error) {
    console.error("Exception in createOrUpdateProfile:", error);
    
    // Return the profile object as a fallback
    return {
      id: userId,
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      phone: profileData.phone || '',
      role: profileData.role || 'customer',
      created_at: new Date().toISOString()
    };
  }
}
