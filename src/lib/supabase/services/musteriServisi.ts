import { supabase } from '../client';

export const musteriServisi = {
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        throw new Error('Kullanıcı bulunamadı');
      }
      
      console.log('Getting dukkan ID for user:', user.id);
      
      // First check if user is an admin (dukkan owner)
      const { data: dukkanlar, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanError) {
        console.log('Error querying dukkanlar:', dukkanError);
      }
      
      if (dukkanlar && dukkanlar.id) {
        console.log('Found dukkan ID (as owner):', dukkanlar.id);
        return dukkanlar.id;
      }
      
      // If not, check if user is staff
      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
        
      if (personelError) {
        console.log('Error querying personel:', personelError);
      }
      
      if (personel && personel.dukkan_id) {
        console.log('Found dukkan ID (as staff):', personel.dukkan_id);
        return personel.dukkan_id;
      }
      
      // Check profiles table as last resort
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.log('Error querying profiles:', profileError);
      }
      
      if (profile && profile.dukkan_id) {
        console.log('Found dukkan ID (from profile):', profile.dukkan_id);
        return profile.dukkan_id;
      }
      
      // Last-ditch effort - get dukkanId from localstorage if it exists
      const localDukkanId = localStorage.getItem('dukkanId');
      if (localDukkanId) {
        console.log('Found dukkan ID (from localStorage):', localDukkanId);
        return parseInt(localDukkanId);
      }
      
      console.log('Could not find a dukkan ID for the user');
      return null;
    } catch (error) {
      console.error('Error getting dukkan ID:', error);
      return null;
    }
  },

  async hepsiniGetir(dukkanId?: number | null) {
    try {
      let shopId = dukkanId;
      if (shopId === null || shopId === undefined) {
        shopId = await this.getCurrentUserDukkanId();
      }
      
      if (!shopId) {
        // Try to load from local storage
        const localDukkanId = localStorage.getItem('dukkanId');
        if (localDukkanId) {
          shopId = parseInt(localDukkanId);
        } else {
          throw new Error('Dükkan bilgisi bulunamadı');
        }
      }
      
      // Store in localStorage for future use
      if (shopId) {
        localStorage.setItem('dukkanId', String(shopId));
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('first_name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
      throw error;
    }
  },
  
  async getirById(id: number) {
    return this.getir(id);
  },
  
  async ekle(musteri: any) {
    try {
      if (!musteri.dukkan_id) {
        musteri.dukkan_id = await this.getCurrentUserDukkanId();
      }
      
      if (!musteri.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .insert([musteri])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      throw error;
    }
  }
};
