
import { supabase } from '../client';
import { authService } from '@/lib/auth/authService';

export const calismaSaatleriServisi = {
  async getCurrentDukkanId() {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      const { data: dukkanlar, error } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Dükkan ID alma hatası:', error);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('dukkan_id')
          .eq('id', user.id)
          .maybeSingle();
        
        return profiles?.dukkan_id;
      }
      
      return dukkanlar?.id;
    } catch (error) {
      console.error('Dükkan ID alma hatası:', error);
      return null;
    }
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      let shopId = dukkanId;
      
      if (!shopId) {
        shopId = await this.getCurrentDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('gun_sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Çalışma saati getirme hatası:', error);
      throw error;
    }
  },
  
  async ekle(saat: any) {
    try {
      if (!saat.dukkan_id) {
        saat.dukkan_id = await this.getCurrentDukkanId();
      }
      
      if (!saat.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert([saat])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Çalışma saati ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Çalışma saati güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Çalışma saati silme hatası:', error);
      throw error;
    }
  },

  // Add the dukkanSaatleriGetir method to fix the missing method error
  async dukkanSaatleriGetir(dukkanId: number) {
    return this.hepsiniGetir(dukkanId);
  }
};
