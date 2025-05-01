
import { supabase } from '../client';

export const getCurrentDukkanId = async (): Promise<number | null> => {
  try {
    console.log("Getting current dukkan ID...");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return null;
    }
    
    console.log("User found, getting dukkan ID");
    
    // First, check user metadata
    if (user.user_metadata?.dukkan_id) {
      console.log("Found dukkan_id in user metadata:", user.user_metadata.dukkan_id);
      return user.user_metadata.dukkan_id;
    }
    
    // Check if user is admin
    const role = user.user_metadata?.role;
    console.log("User role:", role);
    
    if (role === 'admin') {
      // Admin user - get dukkan by user_id
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .single();
        
      if (error) {
        console.error("Error getting dukkan as admin:", error);
        if (error.code !== 'PGRST116') { // Not Found error
          throw error;
        }
        return null;
      }
      
      console.log("Found dukkan as admin:", data?.id);
      return data?.id;
    } else if (role === 'staff') {
      // Staff user - get dukkan through personeller
      const { data, error } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .single();
        
      if (error) {
        console.error("Error getting dukkan as staff:", error);
        if (error.code !== 'PGRST116') { // Not Found error
          throw error;
        }
        return null;
      }
      
      console.log("Found dukkan as staff:", data?.dukkan_id);
      return data?.dukkan_id;
    }
    
    // Try to get from profiles as last resort
    const { data, error } = await supabase
      .from('profiles')
      .select('dukkan_id')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error("Error getting dukkan from profile:", error);
      if (error.code !== 'PGRST116') { // Not Found error
        throw error;
      }
      return null;
    }
    
    console.log("Found dukkan from profile:", data?.dukkan_id);
    return data?.dukkan_id;
  } catch (error) {
    console.error('Error getting dukkan ID:', error);
    return null;
  }
};
