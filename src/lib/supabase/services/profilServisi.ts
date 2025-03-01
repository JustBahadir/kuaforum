
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
        const role = user.user_metadata?.role || 'customer';
        console.log("Retrieved user role:", role);
        
        return {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          role: role
        };
      }
      
      // If profile is null but user exists, create a basic profile
      if (!data) {
        const role = user.user_metadata?.role || 'customer';
        const defaultProfile = {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          role: role
        };
        
        // Try to create this profile in the database
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert(defaultProfile)
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating profile:", createError);
            return defaultProfile;
          }
          
          return newProfile;
        } catch (createErr) {
          console.error("Exception in profile creation:", createErr);
          return defaultProfile;
        }
      }
      
      return data;
    } catch (error) {
      console.error("Exception in profile fetch:", error);
      // Return basic profile from auth data as fallback
      return {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        role: user.user_metadata?.role || 'customer'
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
      
      // If staff role, make sure there's a corresponding personel record
      if (profile.role === 'staff' || data.role === 'staff') {
        try {
          // Check if there's already a personel record with this auth_id
          const { data: existingPersonel } = await supabase
            .from('personel')
            .select('*')
            .eq('auth_id', user.id)
            .maybeSingle();
            
          if (!existingPersonel) {
            // Create a new personel record
            const fullName = `${profile.first_name || data.first_name || ''} ${profile.last_name || data.last_name || ''}`.trim();
            
            await supabase
              .from('personel')
              .insert({
                auth_id: user.id,
                ad_soyad: fullName,
                telefon: profile.phone || data.phone || '',
                eposta: user.email || '',
                adres: '',
                personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`, // Generate a random staff number
                maas: 0,
                calisma_sistemi: 'aylik',
                prim_yuzdesi: 0
              });
          } else {
            // Update the existing personel record with the latest name and phone
            const fullName = `${profile.first_name || data.first_name || ''} ${profile.last_name || data.last_name || ''}`.trim();
            
            if (fullName) {
              await supabase
                .from('personel')
                .update({
                  ad_soyad: fullName,
                  telefon: profile.phone || data.phone || '',
                  eposta: user.email || existingPersonel.eposta
                })
                .eq('auth_id', user.id);
            }
          }
        } catch (staffErr) {
          console.error("Error handling staff record:", staffErr);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("Error in profile update:", error);
      
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
        
        // Try to get role from auth metadata
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData && userData.user && userData.user.user_metadata) {
          return userData.user.user_metadata.role || 'customer';
        }
        
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
        role: profileData.role || existingProfile?.role || 'customer'
      };
      
      // Try to update profile in database
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
        
        // If staff role, make sure there's a corresponding personel record
        if (profile.role === 'staff') {
          try {
            // Check if there's already a personel record with this auth_id
            const { data: existingPersonel } = await supabase
              .from('personel')
              .select('*')
              .eq('auth_id', userId)
              .maybeSingle();
              
            // Get user email
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            const userEmail = userData?.user?.email || '';
              
            if (!existingPersonel) {
              // Create a new personel record
              const fullName = `${profile.first_name} ${profile.last_name}`.trim();
              
              await supabase
                .from('personel')
                .insert({
                  auth_id: userId,
                  ad_soyad: fullName,
                  telefon: profile.phone || '',
                  eposta: userEmail,
                  adres: '',
                  personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`, // Generate a random staff number
                  maas: 0,
                  calisma_sistemi: 'aylik',
                  prim_yuzdesi: 0
                });
            } else {
              // Update the existing personel record with the latest name and phone
              const fullName = `${profile.first_name} ${profile.last_name}`.trim();
              
              if (fullName) {
                await supabase
                  .from('personel')
                  .update({
                    ad_soyad: fullName,
                    telefon: profile.phone || '',
                    eposta: userEmail || existingPersonel.eposta
                  })
                  .eq('auth_id', userId);
              }
            }
          } catch (staffErr) {
            console.error("Error handling staff record:", staffErr);
          }
        }
        
        return data;
      } catch (dbError: any) {
        // If database update fails, update auth metadata as fallback
        console.error("Using auth fallback for profile creation:", dbError);
        
        const { data: userUpdate } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            role: profile.role
          }
        });
        
        return {
          ...profile,
          created_at: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Exception in createOrUpdateProfile:", error);
      throw error;
    }
  }
};
