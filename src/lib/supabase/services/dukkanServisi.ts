
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
      .eq('kullanici_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows found
      console.error('Error fetching user dukkan:', error);
      throw error;
    }
    
    return data || null;
  },
  
  kullaniciDukkaniniGetir: async () => {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return null;
    }
    
    return await dukkanServisi.kullanicininIsletmesi(user.user.id);
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

  // Adding methods needed by ShopSettings
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
        kullanici_id: user.user.id
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
  // Alias specific methods for backward compatibility
  getCurrentUserId: dukkanServisi.getCurrentUserId,
  update: dukkanServisi.guncelle,
  create: dukkanServisi.olustur
};
