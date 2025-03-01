import { supabase } from '../client';
import { Profile } from '../types';

export const profilServisi = {
  async getir() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      try {
        // First try to get profile from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          
          // Return basic profile from auth data as fallback
          const role = user.user_metadata?.role || 'customer';
          console.log("Retrieved user role from metadata:", role);
          
          // Try to create this profile in the database - use direct insert instead of profiles table
          try {
            const defaultProfile = {
              id: user.id,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              phone: user.user_metadata?.phone || '',
              role: role
            };
            
            // Use direct SQL to bypass RLS when creating profile
            const { data: creationResult, error: creationError } = await supabase.rpc(
              'create_profile_for_user',
              {
                user_id: user.id,
                user_first_name: defaultProfile.first_name,
                user_last_name: defaultProfile.last_name,
                user_phone: defaultProfile.phone,
                user_role: defaultProfile.role
              }
            );
            
            if (creationError) {
              console.error("Error creating profile via RPC:", creationError);
              
              // Try standard insert as fallback
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .single();
                
              if (insertError) {
                console.error("Error creating profile with insert:", insertError);
                return defaultProfile;
              }
              
              return newProfile;
            }
            
            // Re-fetch the profile to get the created record
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
              
            return newProfile || defaultProfile;
          } catch (createErr) {
            console.error("Exception in profile creation:", createErr);
            
            // Return the default profile if creation fails
            return {
              id: user.id,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              phone: user.user_metadata?.phone || '',
              role: role
            };
          }
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
          
          // Try to create this profile in the database via RPC
          try {
            const { data: creationResult, error: creationError } = await supabase.rpc(
              'create_profile_for_user',
              {
                user_id: user.id,
                user_first_name: defaultProfile.first_name,
                user_last_name: defaultProfile.last_name,
                user_phone: defaultProfile.phone,
                user_role: defaultProfile.role
              }
            );
            
            if (creationError) {
              console.error("Error creating profile via RPC:", creationError);
              
              // Try standard insert as fallback
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .single();
                
              if (insertError) {
                console.error("Error creating profile with insert:", insertError);
                return defaultProfile;
              }
              
              return newProfile;
            }
            
            // Re-fetch the profile to get the created record
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
              
            return newProfile || defaultProfile;
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
    } catch (error) {
      console.error("Error in getir:", error);
      return null;
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
          
          data = createData;
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
            const fullName = `${profile.first_name || data.first_name || ''} ${profile.last_name || data.last_name || ''}`.trim() || 'Personel';
            
            await supabase
              .from('personel')
              .insert({
                auth_id: user.id,
                ad_soyad: fullName,
                telefon: profile.phone || data.phone || '',
                eposta: user.email || '',
                adres: '',
                personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
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
        try {
          const { data: userResponse } = await supabase.auth.getUser();
          if (userResponse && userResponse.user && userResponse.user.id === userId) {
            return userResponse.user.user_metadata?.role || 'customer';
          }
        } catch (userError) {
          console.error("Error getting user:", userError);
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
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'update_profile_for_user',
          {
            user_id: userId,
            user_first_name: profile.first_name,
            user_last_name: profile.last_name,
            user_phone: profile.phone,
            user_role: profile.role
          }
        );
        
        if (rpcError) {
          console.error("Error updating profile via RPC:", rpcError);
          throw rpcError;
        }
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
          let userEmail = '';
          try {
            // Use auth.getUser API
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.id === userId) {
              userEmail = userData.user.email || '';
            }
          } catch (error) {
            console.error("Error getting user email:", error);
          }
              
          if (!existingPersonel) {
            // Create a new personel record
            const fullName = `${profile.first_name} ${profile.last_name}`.trim() || 'Personel';
              
            const { error: insertError } = await supabase
              .from('personel')
              .insert({
                auth_id: userId,
                ad_soyad: fullName,
                telefon: profile.phone || '',
                eposta: userEmail || '',
                adres: '',
                personel_no: `S${Math.floor(Math.random() * 9000) + 1000}`,
                maas: 0,
                calisma_sistemi: 'aylik',
                prim_yuzdesi: 0
              });
                
            if (insertError) {
              console.error("Error creating personnel record:", insertError);
            }
          } else {
            // Update the existing personel record with the latest name and phone
            const fullName = `${profile.first_name} ${profile.last_name}`.trim();
              
            if (fullName) {
              const { error: updateError } = await supabase
                .from('personel')
                .update({
                  ad_soyad: fullName,
                  telefon: profile.phone || '',
                  eposta: userEmail || existingPersonel.eposta
                })
                .eq('auth_id', userId);
                  
              if (updateError) {
                console.error("Error updating personnel record:", updateError);
              }
            }
          }
        } catch (staffErr) {
          console.error("Error handling staff record:", staffErr);
        }
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
};
