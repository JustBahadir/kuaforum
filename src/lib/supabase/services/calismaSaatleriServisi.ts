
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';
import { kategoriServisi } from './kategoriServisi';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .order('gun_sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },

  async dukkanSaatleriGetir(dukkanId: number) {
    try {
      if (!dukkanId) {
        console.warn('dukkanSaatleriGetir için dükkan ID belirtilmedi');
        dukkanId = await kategoriServisi.getCurrentUserDukkanId();
        
        if (!dukkanId) {
          throw new Error('İşletme bilgisi bulunamadı');
        }
      }
      
      console.log('calismaSaatleriServisi: Fetching hours for shop ID:', dukkanId);
      
      // Try to get existing hours
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('gun_sira', { ascending: true });

      if (error) {
        console.error('Çalışma saatleri veritabanı hatası:', error);
        throw error;
      }
      
      // If no data returned, create default hours
      if (!data || data.length === 0) {
        console.log('calismaSaatleriServisi: No hours found, creating defaults');
        const defaultHours = this.defaultWorkingHours(dukkanId);
        const createdHours = await this.ekle(defaultHours);
        return createdHours;
      }
      
      console.log('calismaSaatleriServisi: Hours retrieved:', data);
      return data;
    } catch (error) {
      console.error('Dükkan çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },

  async guncelle(saatler: CalismaSaati[]) {
    try {
      console.log('calismaSaatleriServisi: Updating hours:', saatler);
      
      // Ensure proper data structure - simplify the data we send
      const cleanedSaatler = saatler.map(saat => {
        if (saat.kapali) {
          return {
            id: saat.id,
            dukkan_id: saat.dukkan_id,
            gun: saat.gun,
            gun_sira: saat.gun_sira,
            acilis: null,
            kapanis: null,
            kapali: true
          };
        }
        
        return {
          id: saat.id,
          dukkan_id: saat.dukkan_id,
          gun: saat.gun,
          gun_sira: saat.gun_sira,
          acilis: saat.acilis,
          kapanis: saat.kapanis,
          kapali: false
        };
      });
      
      // Update one by one to avoid potential bulk update issues
      for (const saat of cleanedSaatler) {
        const { error } = await supabase
          .from('calisma_saatleri')
          .update({
            acilis: saat.acilis,
            kapanis: saat.kapanis,
            kapali: saat.kapali
          })
          .eq('id', saat.id);
          
        if (error) {
          console.error('Update error for item:', saat, error);
          throw error;
        }
      }
      
      // Get updated records
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .in('id', saatler.map(s => s.id))
        .order('gun_sira', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri güncelleme hatası:', error);
      throw error;
    }
  },
  
  async tekGuncelle(saat: CalismaSaati) {
    try {
      // Simplify: Only send what needs to be updated
      const updateData = saat.kapali 
        ? { acilis: null, kapanis: null, kapali: true } 
        : { acilis: saat.acilis, kapanis: saat.kapanis, kapali: false };
        
      console.log('tekGuncelle - Updating with data:', updateData, 'for id:', saat.id);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updateData)
        .eq('id', saat.id)
        .select();

      if (error) {
        console.error('Single update error details:', error);
        throw error;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Çalışma saati güncelleme hatası:', error);
      throw error;
    }
  },
  
  async ekle(saatler: Omit<CalismaSaati, 'id'>[]) {
    try {
      console.log('calismaSaatleriServisi: Adding hours:', saatler);
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saatler)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri ekleme hatası:', error);
      throw error;
    }
  },

  defaultWorkingHours(dukkanId: number) {
    return gunSiralama.map((gun, index) => ({
      dukkan_id: dukkanId,
      gun,
      gun_sira: index,
      acilis: index >= 5 ? null : '09:00',
      kapanis: index >= 5 ? null : '19:00',
      kapali: index >= 5 // Only weekdays (first 5 days) are active by default
    }));
  }
};
