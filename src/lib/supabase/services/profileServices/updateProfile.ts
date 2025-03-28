
import { supabase } from '../../client';
import { Profile } from '../../types';
import { ProfileServiceError, ProfileUpdateData, ProfileCreationParams } from './profileTypes';

/**
 * Updates a user's profile
 */
export async function updateProfile(data: ProfileUpdateData): Promise<Profile | null> {
  try {
    console.log("Profil güncelleniyor:", data);
    
    // Get the current session to get the user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Kullanıcı bilgisi alınamadı:", userError);
      throw {
        message: "Kullanıcı bilgisi alınamadı: " + (userError?.message || "Bilinmeyen hata"),
        original: userError
      };
    }
    
    const userId = user.id;
    
    // Always update auth user metadata for better fallback behavior
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          gender: data.gender || null,
          birthdate: data.birthdate,
          role: data.role,
          avatar_url: data.avatar_url,
          address: data.address,
          iban: data.iban
        }
      });
      
      if (userUpdateError) {
        console.error("Kullanıcı metadata güncellenirken hata:", userUpdateError);
        // Continue anyway, we'll update the profile
      } else {
        console.log("Kullanıcı metadata başarıyla güncellendi");
      }
    } catch (err) {
      console.error("Kullanıcı metadata güncellenirken istisna:", err);
      // Continue anyway, we'll update the profile
    }
    
    // Prepare the data to update
    const updateData: Record<string, any> = {};
    
    // Only include fields that exist in the data object
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.birthdate !== undefined) updateData.birthdate = data.birthdate;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.iban !== undefined) updateData.iban = data.iban;
    
    console.log("Son güncelleme verisi:", updateData);
    
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (!existingProfile) {
        // Create new profile if it doesn't exist
        console.log("Profil mevcut değil, yeni profil oluşturuluyor");
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...updateData
          })
          .select('*')
          .maybeSingle();
          
        if (insertError) {
          console.error("Profil oluşturulurken hata:", insertError);
          // If we can't update the profile, return whatever we have from user metadata
          return {
            id: userId,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            gender: data.gender || null,
            birthdate: data.birthdate || null,
            avatar_url: data.avatar_url || '',
            address: data.address || '',
            iban: data.iban || '',
            role: data.role || 'customer',
            created_at: new Date().toISOString()
          };
        }
        
        return newProfile;
      }
      
      // Update existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error("Profil güncellenirken hata:", error);
        
        // If we get RLS errors, return the data from metadata as fallback
        if (error.code === '42P17') {
          console.warn("Profil güncellemede özyineleme hatası, metadata tabanlı profil döndürülüyor");
          return {
            id: userId,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            gender: data.gender || null,
            birthdate: data.birthdate || null,
            avatar_url: data.avatar_url || '',
            address: data.address || '',
            iban: data.iban || '',
            role: data.role || 'customer',
            created_at: new Date().toISOString()
          };
        }
        
        throw error;
      }
      
      console.log("Profil başarıyla güncellendi:", profile);
      return profile;
      
    } catch (error) {
      console.error("Profil güncelleme işleminde hata:", error);
      throw {
        message: "Profil güncellenirken bir hata oluştu: " + (error as any).message,
        original: error
      };
    }
  } catch (error) {
    console.error("updateProfile fonksiyonunda hata:", error);
    throw error as ProfileServiceError;
  }
}

/**
 * Creates or updates a user profile
 */
export async function createOrUpdateProfile(
  userId: string, 
  profileData: ProfileCreationParams
): Promise<Profile | null> {
  try {
    console.log("Kullanıcı için profil oluşturuluyor veya güncelleniyor:", userId, "veri:", profileData);
    
    // Update auth user metadata
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role,
          phone: profileData.phone,
          gender: profileData.gender || null,
          birthdate: profileData.birthdate,
          avatar_url: profileData.avatar_url,
          address: profileData.address,
          iban: profileData.iban
        }
      });
      
      if (userUpdateError) {
        console.error("Kullanıcı metadata güncellenirken hata:", userUpdateError);
      } else {
        console.log("Kullanıcı metadata başarıyla güncellendi");
      }
    } catch (error) {
      console.error("Kullanıcı metadata güncellenirken hata:", error);
      // Continue anyway, we'll try to update the profile
    }
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Profil alınırken hata:", fetchError);
    }
    
    let profile: Profile | null = null;
    
    // If profile exists, update it
    if (existingProfile) {
      console.log("Mevcut profil güncelleniyor:", existingProfile.id);
      
      // Prepare update data
      const updateData: Record<string, any> = {};
      if (profileData.first_name !== undefined) updateData.first_name = profileData.first_name;
      if (profileData.last_name !== undefined) updateData.last_name = profileData.last_name;
      if (profileData.role !== undefined) updateData.role = profileData.role;
      if (profileData.phone !== undefined) updateData.phone = profileData.phone;
      if (profileData.gender !== undefined) updateData.gender = profileData.gender || null;
      if (profileData.birthdate !== undefined) updateData.birthdate = profileData.birthdate;
      if (profileData.avatar_url !== undefined) updateData.avatar_url = profileData.avatar_url;
      if (profileData.address !== undefined) updateData.address = profileData.address;
      if (profileData.iban !== undefined) updateData.iban = profileData.iban;
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .maybeSingle();
      
      if (updateError) {
        console.error("Profil güncellenirken hata:", updateError);
        // Return data from user metadata as fallback
        return {
          id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          role: profileData.role || 'customer',
          phone: profileData.phone || '',
          gender: profileData.gender || null,
          birthdate: profileData.birthdate || null,
          avatar_url: profileData.avatar_url || '',
          address: profileData.address || '',
          iban: profileData.iban || '',
          created_at: new Date().toISOString()
        };
      }
      
      profile = updatedProfile;
      console.log("Profil başarıyla güncellendi:", profile);
    } else {
      // If profile doesn't exist, create it
      console.log("Kullanıcı için yeni profil oluşturuluyor:", userId);
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          role: profileData.role || 'customer',
          phone: profileData.phone || '',
          gender: profileData.gender || null,
          birthdate: profileData.birthdate || null,
          avatar_url: profileData.avatar_url || '',
          address: profileData.address || '',
          iban: profileData.iban || '',
        })
        .select('*')
        .maybeSingle();
      
      if (insertError) {
        console.error("Profil eklenirken hata:", insertError);
        // Return data from user metadata as fallback
        return {
          id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          role: profileData.role || 'customer',
          phone: profileData.phone || '',
          gender: profileData.gender || null,
          birthdate: profileData.birthdate || null,
          avatar_url: profileData.avatar_url || '',
          address: profileData.address || '',
          iban: profileData.iban || '',
          created_at: new Date().toISOString()
        };
      }
      
      profile = newProfile;
      console.log("Profil başarıyla oluşturuldu:", profile);
    }
    
    return profile;
  } catch (error) {
    console.error("createOrUpdateProfile fonksiyonunda hata:", error);
    throw {
      message: "Profil oluşturulurken veya güncellenirken bir hata oluştu",
      original: error
    };
  }
}
