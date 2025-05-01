
import { supabase } from '../client';
import { authService } from '@/lib/auth/authService';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  async getCurrentDukkanId() {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('dukkanlar')
        .select('id')
        .eq('sahibi_id', user.id)
        .single();
      
      if (error) {
        console.error('Dükkan ID alma hatası:', error);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('dukkan_id')
          .eq('id', user.id)
          .single();
          
        return profileData?.dukkan_id;
      }
      
      return data?.id;
    } catch (error) {
      console.error('getCurrentDukkanId hatası:', error);
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
      
      // Get existing records first
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('gun_sira', { ascending: true });
        
      if (error) throw error;
      
      // Ensure we have all days with proper casing
      const gunler = [
        { gun: "Pazartesi", gun_sira: 0 },
        { gun: "Salı", gun_sira: 1 },
        { gun: "Çarşamba", gun_sira: 2 },
        { gun: "Perşembe", gun_sira: 3 },
        { gun: "Cuma", gun_sira: 4 },
        { gun: "Cumartesi", gun_sira: 5 },
        { gun: "Pazar", gun_sira: 6 },
      ];
      
      const existingGunler = {};
      (data || []).forEach(saat => {
        const gun = gunler.find(g => g.gun_sira === saat.gun_sira);
        if (gun) {
          existingGunler[gun.gun_sira] = saat;
        }
      });
      
      // Fill in any missing days
      const result = gunler.map(gun => {
        if (existingGunler[gun.gun_sira]) {
          const saat = existingGunler[gun.gun_sira];
          // Ensure proper casing for day name
          return { ...saat, gun: gun.gun };
        } else {
          return {
            dukkan_id: shopId,
            gun: gun.gun,
            gun_sira: gun.gun_sira,
            acilis: "09:00",
            kapanis: "18:00",
            kapali: false
          };
        }
      });
      
      return result;
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
      // Use our main method to get all hours with proper formatting
      return this.hepsiniGetir(dukkanId);
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
      
      // Check if a record already exists for this day and shop
      const { data: existingData } = await supabase
        .from('calisma_saatleri')
        .select('id')
        .eq('dukkan_id', calismaSaati.dukkan_id)
        .eq('gun_sira', calismaSaati.gun_sira);
      
      if (existingData && existingData.length > 0) {
        // Update the existing record instead of creating a new one
        return this.guncelle(existingData[0].id, calismaSaati);
      }
      
      // Create a new record
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
      console.log('Updating working hour with ID:', id, updates);
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('Çalışma saati güncelleme hatası:', error);
        throw error;
      }
      
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
      
      return this.guncelle(updates.id, updates);
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
