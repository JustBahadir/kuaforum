
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';

export const calismaSaatleriServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      let query = supabase
        .from('calisma_saatleri')
        .select('*');
      
      if (dukkanId) {
        query = query.eq('dukkan_id', dukkanId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Çalışma saatleri getirme hatası:", error);
        throw error;
      }
      
      // Sort by predefined day order
      return (data || []).sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Çalışma saatleri getirme sırasında hata:", err);
      throw err;
    }
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    try {
      console.log("Toplu güncelleme için gönderilen saatler:", saatler);
      
      // Filter out entries without required fields
      const validSaatler = saatler.filter(saat => saat.dukkan_id !== undefined && saat.gun);
      
      if (validSaatler.length === 0) {
        console.warn("Güncelleme için geçerli çalışma saati bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(validSaatler, { onConflict: 'dukkan_id,gun' })
        .select();

      if (error) {
        console.error("Çalışma saatleri güncelleme hatası:", error);
        throw error;
      }
      
      console.log("Güncelleme sonucu:", data);
      
      // Sort by predefined day order
      return (data || []).sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Güncelleme işlemi sırasında hata:", err);
      throw err;
    }
  },
  
  async tekGuncelle(id: number, updates: Partial<CalismaSaati>) {
    try {
      // Ensure we have a valid ID
      if (!id || id < 0) {
        throw new Error("Geçerli ID gerekli");
      }
      
      console.log(`ID ${id} için güncelleniyor:`, updates);
      
      // Ensure null values are properly handled for closed days
      if (updates.kapali === true) {
        updates.acilis = null;
        updates.kapanis = null;
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Tek çalışma saati güncelleme hatası:", error);
        throw error;
      }
      
      console.log("Tek güncelleme sonucu:", data);
      return data?.[0] || null;
    } catch (err) {
      console.error(`ID ${id} güncellenirken hata:`, err);
      throw err;
    }
  },
  
  async ekle(saat: Omit<CalismaSaati, "id">) {
    try {
      console.log("Eklenecek çalışma saati:", saat);
      
      // Validate required fields
      if (!saat.gun || !saat.dukkan_id) {
        throw new Error("Gün ve dükkan ID zorunludur");
      }

      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert([saat])
        .select();

      if (error) {
        console.error("Çalışma saati ekleme hatası:", error);
        throw error;
      }
      
      console.log("Ekleme sonucu:", data);
      return data[0];
    } catch (err) {
      console.error("Çalışma saati eklenirken hata:", err);
      throw err;
    }
  },
  
  async dukkanSaatleriGetir(dukkanId: number) {
    try {
      if (!dukkanId) {
        console.warn("Dükkan ID gerekli");
        throw new Error("Dükkan ID gerekli");
      }
      
      console.log(`Dükkan ${dukkanId} için çalışma saatleri getiriliyor`);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId);

      if (error) {
        console.error("Dükkan saatleri getirme hatası:", error);
        throw error;
      }
      
      console.log(`Dükkan ${dukkanId} için çalışma saatleri:`, data);
      
      if (!data || data.length === 0) {
        // If no hours found, return default hours
        return this.getDefaultWorkingHours(dukkanId);
      }
      
      // Sort by predefined day order
      return data.sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Dükkan saatleri getirme sırasında hata:", err);
      return this.getDefaultWorkingHours(dukkanId);
    }
  },
  
  // Helper method to get default working hours without DB operations
  getDefaultWorkingHours(dukkanId: number) {
    return gunSiralama.map((gun, index) => ({
      id: -(index + 1), // Using negative IDs to indicate these are temporary
      gun,
      acilis: "09:00",
      kapanis: "18:00",
      kapali: false,
      dukkan_id: dukkanId
    }));
  }
};
