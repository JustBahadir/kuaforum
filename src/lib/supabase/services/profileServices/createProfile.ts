
import { supabase } from '../../client';
import { Profile } from '../../types';
import { ProfileCreationParams } from './profileTypes';

/**
 * Creates a default profile for a user based on their auth data
 */
export async function createDefaultProfile(user: any): Promise<Profile> {
  const defaultProfile = {
    id: user.id,
    first_name: user.user_metadata?.first_name || '',
    last_name: user.user_metadata?.last_name || '',
    phone: user.user_metadata?.phone || '',
    role: user.user_metadata?.role || 'customer'
  };
  
  try {
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
    return defaultProfile;
  }
}

/**
 * Create a new profile using RPC to bypass RLS
 */
export async function createProfileViaRPC(params: ProfileCreationParams): Promise<Profile | null> {
  try {
    // Create RPC parameters from ProfileCreationParams
    const rpcParams = {
      user_id: params.user_id || '',
      user_first_name: params.user_first_name || params.first_name || '',
      user_last_name: params.user_last_name || params.last_name || '',
      user_phone: params.user_phone || params.phone || '',
      user_role: params.user_role || params.role || 'customer'
    };
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_profile_for_user',
      rpcParams
    );
    
    if (rpcError) {
      console.error("Error creating profile via RPC:", rpcError);
      throw rpcError;
    }
    
    // Re-fetch the profile to get the created record
    const { data: newProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', rpcParams.user_id)
      .maybeSingle();
      
    return newProfile || {
      id: rpcParams.user_id,
      first_name: rpcParams.user_first_name,
      last_name: rpcParams.user_last_name,
      phone: rpcParams.user_phone,
      role: rpcParams.user_role,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in createProfileViaRPC:", error);
    return null;
  }
}
