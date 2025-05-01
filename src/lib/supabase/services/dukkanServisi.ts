
import { supabase } from '../client';

export const dukkanServisi = {
  getirById: async (id: number) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching dukkan:', error);
      throw error;
    }
    
    return data;
  },
  
  kullanicininIsletmesi: async (userId: string) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('sahibi_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows found
      console.error('Error fetching user dukkan:', error);
      throw error;
    }
    
    return data || null;
  },
  
  kullaniciDukkaniniGetir: async () => {
    try {
      // First try to get the current user
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        return null;
      }
      
      // First try to get from dukkanlar where the user is the owner
      const { data: ownedDukkan, error: ownedError } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('sahibi_id', user.user.id)
        .single();
        
      if (!ownedError && ownedDukkan) {
        return ownedDukkan;
      }
      
      // Then check if user is staff in a dukkan
      const { data: staffDukkan, error: staffError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.user.id)
        .single();
        
      if (!staffError && staffDukkan?.dukkan_id) {
        const { data: shopData } = await supabase
          .from('dukkanlar')
          .select('*')
          .eq('id', staffDukkan.dukkan_id)
          .single();
          
        return shopData || null;
      }
      
      // Finally check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.user.id)
        .single();
        
      if (!profileError && profileData?.dukkan_id) {
        const { data: profileShopData } = await supabase
          .from('dukkanlar')
          .select('*')
          .eq('id', profileData.dukkan_id)
          .single();
          
        return profileShopData || null;
      }
      
      console.log('No dukkan found for user');
      return null;
    } catch (error) {
      console.error('Error getting user dukkan:', error);
      return null;
    }
  },
  
  getirByKod: async (kod: string) => {
    const { data, error } = await supabase
      .from('dukkanlar')
      .select('*')
      .eq('kod', kod)
      .single();
    
    if (error) {
      console.error('Error fetching dukkan by code:', error);
      throw error;
    }
    
    return data;
  },
  
  personelAuthIdIsletmesi: async (authId: string) => {
    const { data, error } = await supabase
      .from('personel')
      .select('dukkan_id')
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      console.error('Error fetching staff dukkan:', error);
      return null;
    }
    
    if (!data || !data.dukkan_id) {
      return null;
    }
    
    return await dukkanServisi.getirById(data.dukkan_id);
  },

  getCurrentUserId: async () => {
    const { data: user } = await supabase.auth.getUser();
    return user?.user?.id;
  },
  
  guncelle: async (id: number, data: any) => {
    const { data: result, error } = await supabase
      .from('dukkanlar')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating dukkan:', error);
      throw error;
    }
    
    return result;
  },
  
  olustur: async (data: any) => {
    // Get current user ID to set as owner
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { data: result, error } = await supabase
      .from('dukkanlar')
      .insert({
        ...data,
        sahibi_id: user.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating dukkan:', error);
      throw error;
    }
    
    return result;
  }
};

// For backward compatibility
export const isletmeServisi = {
  ...dukkanServisi,
  getCurrentUserId: dukkanServisi.getCurrentUserId,
  update: dukkanServisi.guncelle,
  create: dukkanServisi.olustur
};
