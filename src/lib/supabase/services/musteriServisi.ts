
import { supabase } from '../client';

export const musteriServisi = {
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // First check if user is an admin (dukkan owner)
      const { data: dukkanlar, error: dukkanError } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (dukkanError) throw dukkanError;
      
      if (dukkanlar) {
        return dukkanlar.id;
      }
      
      // If not, check if user is staff
      const { data: personel, error: personelError } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
        
      if (personelError) throw personelError;
      
      if (personel) {
        return personel.dukkan_id;
      }
      
      // Finally check the profile table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) throw profileError;
      
      if (profile && profile.dukkan_id) {
        return profile.dukkan_id;
      }
      
      return null;
    } catch (error) {
      console.error('Kullanıcı dükkanı getirme hatası:', error);
      throw error;
    }
  },

  async hepsiniGetir(dukkanId?: number | null) {
    try {
      let shopId = dukkanId;
      if (shopId === null || shopId === undefined) {
        shopId = await this.getCurrentUserDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
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
