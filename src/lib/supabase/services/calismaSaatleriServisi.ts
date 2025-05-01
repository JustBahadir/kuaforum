
import { supabase } from '../client';
import { musteriServisi } from './musteriServisi';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  async getCurrentDukkanId() {
    return musteriServisi.getCurrentUserDukkanId();
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
  
  async dukkanSaatleriGetir(dukkanId: number) {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('gun_sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Dükkan çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },
  
  async ekle(calismaSaati: Partial<CalismaSaati>) {
    try {
      if (!calismaSaati.dukkan_id) {
        calismaSaati.dukkan_id = await this.getCurrentDukkanId();
      }
      
      if (!calismaSaati.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert([calismaSaati])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Çalışma saati ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: Partial<CalismaSaati>) {
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
  
  async tekGuncelle(updates: Partial<CalismaSaati>) {
    try {
      if (!updates.id) {
        throw new Error('Güncelleme için ID gerekli');
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updates)
        .eq('id', updates.id)
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
  }
};
