
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { getCurrentDukkanId } from '../utils/getCurrentDukkanId';

export const calismaSaatleriServisi = {
  async getCurrentDukkanId() {
    return getCurrentDukkanId();
  },
  
  async dukkanSaatleriGetir(dukkanId?: number) {
    try {
      let dId = dukkanId;
      if (!dId) {
        dId = await this.getCurrentDukkanId();
      }
      
      if (!dId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dId)
        .order('gun_sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },
  
  async dukkanSaatleriKaydet(saatler: Partial<CalismaSaati>[]) {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saatler)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Çalışma saatleri kaydetme hatası:', error);
      throw error;
    }
  },
  
  async hepsiniGetir(dukkanId?: number) {
    return this.dukkanSaatleriGetir(dukkanId);
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    try {
      // Update each hour separately
      const updates = saatler.map(async (saat) => {
        const { id, ...updateData } = saat;
        const { data, error } = await supabase
          .from('calisma_saatleri')
          .update(updateData)
          .eq('id', id!)
          .select();

        if (error) throw error;
        return data;
      });

      return await Promise.all(updates);
    } catch (error) {
      console.error('Çalışma saatleri güncelleme hatası:', error);
      throw error;
    }
  }
};
