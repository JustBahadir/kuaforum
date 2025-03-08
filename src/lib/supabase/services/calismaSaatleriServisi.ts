
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
      
      return data || [];
    } catch (err) {
      console.error("Çalışma saatleri getirme hatası:", err);
      throw err;
    }
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    try {
      console.log("Güncellenecek saatler:", saatler);
      if (!saatler || !saatler.length) {
        throw new Error("Güncellenecek çalışma saati bulunamadı");
      }
      
      const result = [];
      
      // Process each working hour entry separately
      for (const saat of saatler) {
        const { gun, acilis, kapanis, kapali, dukkan_id } = saat;
        
        if (!gun || !dukkan_id) {
          console.warn("Eksik bilgi:", { gun, dukkan_id });
          continue;
        }
        
        // Create update object with all required fields
        const updateObj = {
          gun,
          acilis: kapali ? null : acilis,
          kapanis: kapali ? null : kapanis,
          kapali: kapali || false,
          dukkan_id
        };
        
        try {
          // Check if record exists
          const { data: existingData, error: checkError } = await supabase
            .from('calisma_saatleri')
            .select('id')
            .eq('dukkan_id', dukkan_id)
            .eq('gun', gun);
            
          if (checkError) {
            console.error("Kayıt kontrol hatası:", checkError);
            continue;
          }
          
          if (existingData && existingData.length > 0) {
            // Update existing record
            const { data, error } = await supabase
              .from('calisma_saatleri')
              .update(updateObj)
              .eq('id', existingData[0].id)
              .select();
              
            if (error) {
              console.error(`ID ${existingData[0].id} güncelleme hatası:`, error);
              continue;
            }
            
            if (data && data.length > 0) {
              result.push(data[0]);
            }
          } else {
            // Insert new record
            const { data, error } = await supabase
              .from('calisma_saatleri')
              .insert([updateObj])
              .select();
              
            if (error) {
              console.error("Yeni kayıt ekleme hatası:", error);
              continue;
            }
            
            if (data && data.length > 0) {
              result.push(data[0]);
            }
          }
        } catch (err) {
          console.error(`Güncelleme hatası (${gun}):`, err);
        }
      }
      
      return result;
    } catch (err) {
      console.error("Çalışma saatleri güncelleme hatası:", err);
      throw err;
    }
  },
  
  async dukkanSaatleriGetir(dukkanId: number) {
    if (!dukkanId) {
      throw new Error("Dükkan ID gereklidir");
    }
    
    try {
      // Fetch working hours for the shop
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId);
        
      if (error) {
        console.error("Dükkan saatleri getirme hatası:", error);
        throw error;
      }
      
      // If we have data, return it
      if (data && data.length > 0) {
        return data;
      }
      
      // If no data, create default hours and return them
      return this.defaultWorkingHours(dukkanId);
    } catch (err) {
      console.error("Dükkan saatleri getirme hatası:", err);
      throw err;
    }
  },
  
  defaultWorkingHours(dukkanId: number) {
    // Create default working hours (9 AM to 7 PM, closed on Sundays)
    return gunSiralama.map(gun => ({
      id: -Math.floor(Math.random() * 1000) - 1, // Temporary negative ID
      gun,
      acilis: "09:00",
      kapanis: "19:00",
      kapali: gun === "pazar", // Closed on Sundays by default
      dukkan_id: dukkanId
    }));
  }
};
