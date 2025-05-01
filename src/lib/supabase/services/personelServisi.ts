
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, try to get the current user's dukkan_id
      if (!dukkanId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Kullanıcı bulunamadı');
        
        // Check if user is admin
        const role = user.user_metadata?.role;
        
        if (role === 'admin') {
          const { data, error } = await supabase
            .from('dukkanlar')
            .select('id')
            .eq('sahibi_id', user.id)
            .single();
            
          if (!error && data) {
            dukkanId = data.id;
          }
        } else {
          throw new Error('Personel listeleme yetkisi bulunmuyor');
        }
      }
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('dukkan_id', dukkanId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel getirme hatası:', error);
      throw error;
    }
  },
  
  // Alias for compatibility
  async getirById(id: number) {
    return personelServisi.getir(id);
  },
  
  async ekle(personelData: Partial<Personel>) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .insert([personelData])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: Partial<Personel>) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Personel silme hatası:', error);
      throw error;
    }
  },
  
  async getAuthPersonel(authId: string) {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('auth_id', authId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Auth personel getirme hatası:', error);
      throw error;
    }
  }
};
