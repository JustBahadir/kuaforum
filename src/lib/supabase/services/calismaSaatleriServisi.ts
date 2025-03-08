
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';

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
        return [];
      }
      
      console.log('calismaSaatleriServisi: Fetching hours for shop ID:', dukkanId);
      
      // Try to get existing hours
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('gun_sira', { ascending: true });

      if (error) {
        // If table doesn't exist yet, return default hours
        console.error('Çalışma saatleri veritabanı hatası:', error);
        return this.defaultWorkingHours(dukkanId);
      }
      
      // If no data returned, create default hours
      if (!data || data.length === 0) {
        console.log('calismaSaatleriServisi: No hours found, returning defaults');
        return this.defaultWorkingHours(dukkanId);
      }
      
      console.log('calismaSaatleriServisi: Hours retrieved:', data);
      return data;
    } catch (error) {
      console.error('Dükkan çalışma saatleri getirme hatası:', error);
      // Return default hours on error
      return this.defaultWorkingHours(dukkanId);
    }
  },

  async guncelle(saatler: CalismaSaati[]) {
    try {
      console.log('calismaSaatleriServisi: Updating hours:', saatler);
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(saatler, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri güncelleme hatası:', error);
      throw error;
    }
  },
  
  async tekGuncelle(saat: CalismaSaati) {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update({
          acilis: saat.acilis,
          kapanis: saat.kapanis,
          kapali: saat.kapali
        })
        .eq('id', saat.id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      acilis: '09:00',
      kapanis: '19:00',
      kapali: index >= 5 // Only weekdays (first 5 days) are active by default
    }));
  }
};
