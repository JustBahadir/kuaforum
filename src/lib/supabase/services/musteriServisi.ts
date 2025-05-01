
import { supabase } from '../client';
import { Musteri } from '../types';
import { getCurrentDukkanId } from '../utils/getCurrentDukkanId';

export const musteriServisi = {
  getCurrentDukkanId,
  
  hepsiniGetir: async (dukkanId?: number) => {
    try {
      console.log("musteriServisi.hepsiniGetir called with dukkanId:", dukkanId);
      
      let id = dukkanId;
      if (!id) {
        id = await getCurrentDukkanId();
        console.log("Fetched current dukkanId:", id);
      }
      
      if (!id) {
        console.error("No dukkan ID available");
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('dukkan_id', id);

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} customers`);
      return data || [];
    } catch (error) {
      console.error('Müşteri listesi getirme hatası:', error);
      throw error;
    }
  },

  getir: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
      throw error;
    }
  },

  ekle: async (musteriData: Partial<Musteri>) => {
    try {
      console.log("Adding customer with data:", musteriData);
      
      // Make sure we have a dukkan_id
      if (!musteriData.dukkan_id) {
        const dukkanId = await getCurrentDukkanId();
        if (!dukkanId) {
          console.error("No dukkan ID available for adding customer");
          throw new Error('İşletme bilgisi bulunamadı');
        }
        musteriData.dukkan_id = dukkanId;
      }
      
      const { data, error } = await supabase
        .from('musteriler')
        .insert([musteriData])
        .select();

      if (error) {
        console.error("Error adding customer:", error);
        throw error;
      }
      
      console.log("Customer added:", data[0]);
      return data[0];
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      throw error;
    }
  },

  guncelle: async (id: number, updates: Partial<Musteri>) => {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      throw error;
    }
  },

  sil: async (id: number) => {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      throw error;
    }
  }
};
