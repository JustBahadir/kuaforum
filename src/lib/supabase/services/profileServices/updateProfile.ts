
import { supabase } from '../../';
import { Profile } from '../../types';
import { ProfileServiceError, ProfileUpdateData } from '../profileServices/profileTypes';

/**
 * Updates a user's profile
 */
export async function updateProfile(data: ProfileUpdateData): Promise<Profile | null> {
  try {
    console.log("Updating profile with data:", data);
    
    // Get the current session to get the user ID
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("Error getting session:", sessionError);
      throw {
        message: "Oturum bilgisi alınamadı: " + (sessionError?.message || "Bilinmeyen hata"),
        original: sessionError
      };
    }
    
    const userId = sessionData.session.user.id;
    
    // Update auth user metadata if first_name or last_name is provided
    if (data.first_name || data.last_name) {
      try {
        const { data: user, error: userError } = await supabase.auth.updateUser({
          data: {
            first_name: data.first_name,
            last_name: data.last_name
          }
        });
        
        if (userError) {
          console.error("Error updating user metadata:", userError);
          // Continue anyway, we'll update the profile
        }
      } catch (err) {
        console.error("Exception updating user metadata:", err);
        // Continue anyway, we'll update the profile
      }
    }
    
    // Update profile in the database
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      throw {
        message: "Profil güncellenirken bir hata oluştu: " + error.message,
        original: error
      };
    }
    
    console.log("Profile updated successfully:", profile);
    return profile;
  } catch (error) {
    console.error("Error in updateProfile:", error);
    throw error as ProfileServiceError;
  }
}

/**
 * Creates or updates a user profile
 */
export async function createOrUpdateProfile(
  userId: string, 
  profileData: { 
    first_name?: string; 
    last_name?: string; 
    role?: string; 
    phone?: string;
    gender?: string;
    birthdate?: string;
  }
): Promise<Profile | null> {
  try {
    console.log("Creating or updating profile for user:", userId, "with data:", profileData);
    
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
    }
    
    // Update auth user metadata
    try {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role
        }
      });
      console.log("Updated user metadata successfully");
    } catch (error) {
      console.error("Error updating user metadata:", error);
      // Continue anyway, we'll try to update the profile
    }
    
    let profile: Profile | null = null;
    
    // If profile exists, update it
    if (existingProfile) {
      console.log("Updating existing profile:", existingProfile.id);
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role,
          phone: profileData.phone,
          gender: profileData.gender,
          birthdate: profileData.birthdate
        })
        .eq('id', userId)
        .select('*')
        .single();
      
      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }
      
      profile = updatedProfile;
      console.log("Profile updated successfully:", profile);
    } else {
      // If profile doesn't exist, create it
      console.log("Creating new profile for user:", userId);
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          role: profileData.role || 'customer',
          phone: profileData.phone || '',
          gender: profileData.gender || '',
          birthdate: profileData.birthdate || null
        })
        .select('*')
        .single();
      
      if (insertError) {
        console.error("Error inserting profile:", insertError);
        throw insertError;
      }
      
      profile = newProfile;
      console.log("Profile created successfully:", profile);
    }
    
    return profile;
  } catch (error) {
    console.error("Error in createOrUpdateProfile:", error);
    throw {
      message: "Profil oluşturulurken veya güncellenirken bir hata oluştu",
      original: error
    };
  }
}
