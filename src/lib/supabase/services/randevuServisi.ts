
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  async dukkanRandevulariniGetir(dukkanId: number | null) {
    try {
      // If dukkanId is not provided, try to get it from user metadata
      const actualDukkanId = dukkanId || await this.getCurrentUserDukkanId();
      
      if (!actualDukkanId) {
        console.error('Randevuları getirmek için dükkan bilgisi bulunamadı');
        return [];
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel_id(*)')
        .eq('dukkan_id', actualDukkanId)
        .order('tarih', { ascending: true });
      
      if (error) {
        console.error('Randevular getirilemedi:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Randevular getirilemedi:', error);
      return [];
    }
  },
  
  async kendiRandevulariniGetir(userId: string | null) {
    try {
      // Get current user if not provided
      const { data: { user } } = await supabase.auth.getUser();
      const actualUserId = userId || user?.id;
      
      if (!actualUserId) {
        console.error('Kullanıcı bilgisi bulunamadı');
        return [];
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select('*, personel:personel_id(*)')
        .eq('customer_id', actualUserId)
        .order('tarih', { ascending: true });
      
      if (error) {
        console.error('Randevular getirilemedi:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Randevular getirilemedi:', error);
      return [];
    }
  },
  
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Try to get from metadata first
      if (user.user_metadata?.dukkan_id) {
        return user.user_metadata.dukkan_id;
      }
      
      // Try from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.dukkan_id) {
        return profile.dukkan_id;
      }
      
      // Try from personel table
      const { data: personel } = await supabase
        .from('personel')
        .select('dukkan_id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (personel?.dukkan_id) {
        return personel.dukkan_id;
      }
      
      // Last resort - check if user is shop owner
      const { data: dukkan } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      return dukkan?.id || null;
    } catch (error) {
      console.error('Dükkan ID alınamadı:', error);
      return null;
    }
  },

  // Add other required methods here
  async randevuOlustur(randevuVerisi: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevuVerisi])
        .select();
      
      if (error) {
        console.error('Randevu oluşturulamadı:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Randevu oluşturulamadı:', error);
      throw error;
    }
  },
  
  async randevuGuncelle(id: number, updates: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Randevu güncellenemedi:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Randevu güncellenemedi:', error);
      throw error;
    }
  },
  
  async randevuSil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Randevu silinemedi:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Randevu silinemedi:', error);
      throw error;
    }
  },
  
  async randevuDurumGuncelle(id: number, durum: string) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Randevu durumu güncellenemedi:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Randevu durumu güncellenemedi:', error);
      throw error;
    }
  }
};
