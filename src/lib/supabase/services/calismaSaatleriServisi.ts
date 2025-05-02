
import { supabase } from '../client';
import { CalismaSaati } from '@/lib/supabase/types';
import { createDefaultWorkingHours, sortWorkingHours } from '@/components/operations/utils/workingHoursUtils';
import { authService } from '@/lib/auth/authService';

export const calismaSaatleriServisi = {
  async dukkanSaatleriGetir(dukkanId: number): Promise<CalismaSaati[]> {
    try {
      if (!dukkanId) {
        throw new Error('Dükkan ID gereklidir');
      }

      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId);

      if (error) {
        throw error;
      }

      // If no hours found for the shop, create defaults
      if (!data || data.length === 0) {
        const defaultHours = createDefaultWorkingHours(dukkanId);
        return defaultHours;
      }

      return sortWorkingHours(data);
    } catch (error) {
      console.error('Çalışma saatlerini getirme hatası:', error);
      throw error;
    }
  },

  async saatleriKaydet(saatler: CalismaSaati[]): Promise<CalismaSaati[]> {
    try {
      if (!saatler || saatler.length === 0) {
        throw new Error('Geçersiz çalışma saatleri');
      }

      const dukkanId = saatler[0].dukkan_id;
      if (!dukkanId) {
        throw new Error('Dükkan ID bulunamadı');
      }

      // First, delete all existing hours for this shop to prevent duplicates
      const { error: deleteError } = await supabase
        .from('calisma_saatleri')
        .delete()
        .eq('dukkan_id', dukkanId);

      if (deleteError) {
        throw deleteError;
      }

      // Now insert the new hours
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saatler)
        .select();

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Çalışma saatlerini kaydetme hatası:', error);
      throw error;
    }
  },

  async saatleriGuncelle(saatler: CalismaSaati[]): Promise<CalismaSaati[]> {
    // We're implementing this as a complete replace operation to avoid any inconsistencies
    return this.saatleriKaydet(saatler);
  }
};
