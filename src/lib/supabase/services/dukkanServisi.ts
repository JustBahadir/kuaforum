
import { supabase } from '../client';
import { Isletme } from '../types';

export const isletmeServisi = {
  getirById: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Dükkan getirme hatası:', error);
      throw error;
    }
  },

  getirByKod: async (kod: string) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('kod', kod)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Dükkan kod ile getirme hatası:', error);
      throw error;
    }
  },

  // Add this method for compatibility
  kodaGoreGetir: async (kod: string) => {
    return isletmeServisi.getirByKod(kod);
  },

  kullaniciDukkaniniGetir: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      // First try to get as owner (admin)
      const { data: ownerData, error: ownerError } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('sahibi_id', user.id)
        .single();

      if (!ownerError && ownerData) {
        console.log("Dükkan found as admin:", ownerData);
        return ownerData;
      }
      
      // If not owner, try as staff
      const { data: staffData, error: staffError } = await supabase
        .from('personel')
        .select('dukkan_id, dukkanlar(*)')
        .eq('auth_id', user.id)
        .single();

      if (!staffError && staffData?.dukkanlar) {
        console.log("Dükkan found as staff:", staffData.dukkanlar);
        return staffData.dukkanlar;
      }
      
      // Try to get from profiles as last resort
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (!profileError && profileData?.dukkan_id) {
        const { data: dukkanData, error: dukkanError } = await supabase
          .from('dukkanlar')
          .select('*')
          .eq('id', profileData.dukkan_id)
          .single();
          
        if (!dukkanError && dukkanData) {
          console.log("Dükkan found from profile:", dukkanData);
          return dukkanData;
        }
      }

      console.log("No dükkan found for user", user.id);
      throw new Error('İşletme bulunamadı. Lütfen önce işletme bilgilerinizi oluşturun.');
    } catch (error) {
      console.error('Kullanıcı dükkanını getirme hatası:', error);
      throw error;
    }
  },

  hepsiniGetir: async () => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .order('ad');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tüm dükkanları getirme hatası:', error);
      throw error;
    }
  },

  kullanicininIsletmesi: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('*')
        .eq('sahibi_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kullanıcının işletmesini getirme hatası:', error);
      throw error;
    }
  },

  personelAuthIdIsletmesi: async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('dukkan_id, dukkanlar(*)')
        .eq('auth_id', authId)
        .single();

      if (error) throw error;
      return data?.dukkanlar;
    } catch (error) {
      console.error('Personel işletmesini getirme hatası:', error);
      throw error;
    }
  },
  
  // Add missing methods
  guncelle: async (id: number, updates: Partial<Isletme>) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Dükkan güncelleme hatası:', error);
      throw error;
    }
  },
  
  ekle: async (isletmeData: Partial<Isletme>) => {
    try {
      const { data, error } = await supabase
        .from('dukkanlar')
        .insert([isletmeData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşletme ekleme hatası:', error);
      throw error;
    }
  }
};

// For backward compatibility
export const dukkanServisi = isletmeServisi;
