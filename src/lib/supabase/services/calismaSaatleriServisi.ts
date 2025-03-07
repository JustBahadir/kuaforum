
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
        return [];
      }
      
      // Sort by predefined day order
      return (data || []).sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Çalışma saatleri getirme sırasında hata:", err);
      return [];
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
      
      // Process each working hour individually to avoid relationships issue
      const results = [];
      for (const saat of validSaatler) {
        try {
          // Handle negative IDs (temporary) vs positive IDs (existing records)
          if (saat.id && typeof saat.id === 'number' && saat.id > 0) {
            // Update existing record
            const { data, error } = await this.tekGuncelle(saat.id, saat);
            if (!error && data) {
              results.push(data);
            } else {
              console.error(`Error updating hour with ID ${saat.id}:`, error);
            }
          } else {
            // Create new record after checking for existing one
            const { data: existingData, error: checkError } = await supabase
              .from('calisma_saatleri')
              .select('id')
              .eq('dukkan_id', saat.dukkan_id)
              .eq('gun', saat.gun);
              
            if (checkError) {
              console.error("Error checking for existing record:", checkError);
            }
            
            if (existingData && existingData.length > 0) {
              // Update existing record instead of creating new one
              const { data, error } = await this.tekGuncelle(existingData[0].id, saat);
              if (!error && data) {
                results.push(data);
              }
            } else {
              // Create new record
              const newData = {
                gun: saat.gun,
                acilis: saat.kapali ? null : (saat.acilis || "09:00"),
                kapanis: saat.kapali ? null : (saat.kapanis || "18:00"),
                kapali: saat.kapali || false,
                dukkan_id: saat.dukkan_id || 0
              };
              
              const { data, error } = await this.ekle(newData);
              if (!error && data) {
                results.push(data);
              }
            }
          }
        } catch (err) {
          console.error(`Error processing hour for day ${saat.gun}:`, err);
        }
      }
      
      console.log("Güncelleme sonucu:", results);
      
      // Sort by predefined day order
      return results.sort((a, b) => {
        const aIndex = gunSiralama.indexOf(a.gun);
        const bIndex = gunSiralama.indexOf(b.gun);
        return aIndex - bIndex;
      });
    } catch (err) {
      console.error("Güncelleme işlemi sırasında hata:", err);
      return [];
    }
  },
  
  async tekGuncelle(id: number, updates: Partial<CalismaSaati>) {
    try {
      console.log(`ID ${id} için güncelleniyor:`, updates);
      
      // Ensure null values are properly handled for closed days
      const updateData: Partial<CalismaSaati> = { ...updates };
      
      if (updateData.kapali) {
        updateData.acilis = null;
        updateData.kapanis = null;
      }
      
      console.log("Final update data:", updateData);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error("Tek çalışma saati güncelleme hatası:", error);
        throw error;
      }
      
      console.log("Tek güncelleme sonucu:", data);
      return data;
    } catch (err) {
      console.error(`ID ${id} güncellenirken hata:`, err);
      throw err;
    }
  },
  
  async ekle(saat: Omit<CalismaSaati, "id">) {
    try {
      // Validate the data before insertion
      if (!saat.gun) {
        throw new Error("Gün bilgisi gerekli");
      }
      
      console.log("Yeni çalışma saati eklenecek:", saat);
      
      // Make sure dukkan_id is set, even if it's 0 for global hours
      const saatObj = {
        ...saat,
        dukkan_id: saat.dukkan_id !== undefined ? saat.dukkan_id : 0
      };
      
      // First check if this day already exists for this shop to avoid duplicates
      const { data: existingData, error: checkError } = await supabase
        .from('calisma_saatleri')
        .select('id')
        .eq('dukkan_id', saatObj.dukkan_id)
        .eq('gun', saatObj.gun);
        
      if (checkError) {
        console.error("Error checking existing record:", checkError);
      }
      
      if (existingData && existingData.length > 0) {
        // Update existing record instead
        return await this.tekGuncelle(existingData[0].id, saatObj);
      }
      
      // Insert new record if none exists
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert([saatObj])
        .select('*');

      if (error) {
        console.error("Çalışma saati ekleme hatası:", error);
        throw error;
      }
      
      console.log("Eklenen çalışma saati:", data?.[0]);
      return data?.[0];
    } catch (err) {
      console.error("Çalışma saati eklenirken hata:", err);
      throw err;
    }
  },
  
  async dukkanSaatleriGetir(dukkanId: number) {
    try {
      if (!dukkanId) {
        console.warn("Dükkan ID gerekli");
        return this.getDefaultWorkingHours(dukkanId);
      }
      
      console.log(`Dükkan ${dukkanId} için çalışma saatleri getiriliyor`);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('dukkan_id', dukkanId);

      if (error) {
        console.error("Dükkan saatleri getirme hatası:", error);
        return this.getDefaultWorkingHours(dukkanId);
      }
      
      console.log(`Dükkan ${dukkanId} için çalışma saatleri:`, data);
      
      if (!data || data.length === 0) {
        // If no hours found, insert default hours into database
        const defaultHours = this.getDefaultWorkingHours(dukkanId);
        const results = [];
        
        for (const hour of defaultHours) {
          try {
            const inserted = await this.ekle({
              gun: hour.gun,
              acilis: hour.kapali ? null : hour.acilis,
              kapanis: hour.kapali ? null : hour.kapanis,
              kapali: hour.kapali,
              dukkan_id: dukkanId
            });
            
            if (inserted) {
              results.push(inserted);
            }
          } catch (err) {
            console.error(`Error inserting default hours for ${hour.gun}:`, err);
          }
        }
        
        if (results.length > 0) {
          return results;
        }
        
        return defaultHours;
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
      kapali: gun === "pazar", // Default to closed on Sunday
      dukkan_id: dukkanId
    }));
  }
};
