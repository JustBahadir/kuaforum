
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';
import { toast } from 'sonner';

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
      // Ensure we have a valid ID
      if (!id) {
        throw new Error("ID gerekli");
      }
      
      console.log(`ID ${id} için güncelleniyor:`, updates);
      
      // Ensure null values are properly handled for closed days
      if (updates.kapali === true) {
        updates.acilis = null;
        updates.kapanis = null;
      }
      
      // We'll avoid using the profile table and directly update only calisma_saatleri
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
  },
  
  async varsayilanSaatleriOlustur(dukkanId: number) {
    try {
      if (!dukkanId) {
        console.error("Dükkan ID gerekli");
        throw new Error("Dükkan ID gerekli");
      }
      
      // First check if hours already exist for this shop
      const { data: existing, error: checkError } = await supabase
        .from('calisma_saatleri')
        .select('id')
        .eq('dukkan_id', dukkanId);
      
      if (checkError) {
        console.error("Mevcut saatleri kontrol ederken hata:", checkError);
        throw checkError;
      }
        
      if (existing && existing.length > 0) {
        console.log("Bu dükkan için çalışma saatleri zaten mevcut, ID:", dukkanId);
        return existing;
      }
      
      // Standard business hours (9-18) with Sunday closed
      const varsayilanSaatler = gunSiralama.map(gun => ({
        gun,
        acilis: gun === "pazar" ? null : "09:00",
        kapanis: gun === "pazar" ? null : "18:00",
        kapali: gun === "pazar", // Sunday closed by default
        dukkan_id: dukkanId
      }));
      
      console.log(`Dükkan ${dukkanId} için varsayılan saatler oluşturuluyor:`, varsayilanSaatler);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(varsayilanSaatler)
        .select();

      if (error) {
        console.error("Varsayılan çalışma saatleri oluşturma hatası:", error);
        throw error;
      }
      
      console.log("Varsayılan saatler oluşturuldu:", data);
      return data;
    } catch (err) {
      console.error("Varsayılan çalışma saatleri oluşturulurken hata:", err);
      throw err;
    }
  },
  
  async dukkanSaatleriGetir(dukkanId: number) {
    try {
      if (!dukkanId) {
        console.warn("Dükkan ID gerekli");
        return [];
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
      
      // Sort by predefined day order
      return (data || []).sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Dükkan saatleri getirme sırasında hata:", err);
      return [];
    }
  }
};
