
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
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
  },
  
  async gunleriGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('gun');

    if (error) {
      console.error("Günleri getirme hatası:", error);
      throw error;
    }
    
    // Always sort by predefined day order
    return (data || []).sort((a, b) => {
      const aIndex = gunSiralama.indexOf(a.gun);
      const bIndex = gunSiralama.indexOf(b.gun);
      return aIndex - bIndex;
    });
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    try {
      console.log("Toplu güncelleme için gönderilen saatler:", saatler);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(saatler)
        .select();

      if (error) {
        console.error("Çalışma saatleri güncelleme hatası:", error);
        throw error;
      }
      
      console.log("Güncelleme sonucu:", data);
      
      // Always sort by predefined day order
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
      console.log(`ID ${id} için güncelleme:`, updates);
      
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
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .insert([saat])
      .select();

    if (error) {
      console.error("Çalışma saati ekleme hatası:", error);
      throw error;
    }
    
    return data[0];
  }
};
