
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*');

      if (error) {
        console.error("Çalışma saatleri getirme hatası:", error);
        throw error;
      }
      
      // Always sort by predefined day order
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
  
  async gunleriGetir() {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('gun');

      if (error) {
        console.error("Günleri getirme hatası:", error);
        throw error;
      }
      
      return (data || []).sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Günleri getirme sırasında hata:", err);
      throw err;
    }
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    try {
      console.log("Toplu güncelleme için gönderilen saatler:", saatler);
      
      // Filter out entries without id
      const validSaatler = saatler.filter(saat => saat.id !== undefined);
      
      if (validSaatler.length === 0) {
        console.warn("Güncelleme için geçerli çalışma saati bulunamadı");
        return [];
      }
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(validSaatler)
        .select();

      if (error) {
        console.error("Çalışma saatleri güncelleme hatası:", error);
        throw error;
      }
      
      console.log("Güncelleme sonucu:", data);
      
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
      if (!id) {
        throw new Error("ID gerekli");
      }
      
      console.log(`ID ${id} için güncelleniyor:`, updates);
      
      // Direct API call to bypass any middleware issues
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
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert([saat])
        .select();

      if (error) {
        console.error("Çalışma saati ekleme hatası:", error);
        throw error;
      }
      
      return data[0];
    } catch (err) {
      console.error("Çalışma saati eklenirken hata:", err);
      throw err;
    }
  }
};
