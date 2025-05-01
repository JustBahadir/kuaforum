
import { supabase } from '../client';

export const musteriServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from current user
      let shopId = dukkanId;
      if (!shopId) {
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
  },
  
  async getCurrentUserDukkanId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }
      
      // First try to get from user metadata
      if (user.user_metadata?.dukkan_id) {
        return Number(user.user_metadata.dukkan_id);
      }
      
      // If not found in metadata, try to get from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('dukkan_id')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Profil bilgisi getirilemedi:', error);
        throw error;
      }
      
      if (!profile || !profile.dukkan_id) {
        console.error('Kullanıcının dükkan bilgisi bulunamadı');
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      return profile.dukkan_id;
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      throw error;
    }
  },
  
  async musteriIslemleriniGetir(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemleri getirme hatası:', error);
      throw error;
    }
  }
};
