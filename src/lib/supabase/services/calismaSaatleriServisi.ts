
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
      
      // Günleri sırala
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
      
      // Gerekli alanları olmayan kayıtları filtrele
      const validSaatler = saatler.filter(saat => saat.dukkan_id !== undefined && saat.gun);
      
      if (validSaatler.length === 0) {
        console.warn("Güncelleme için geçerli çalışma saati bulunamadı");
        return [];
      }
      
      // Her çalışma saatini tek tek işle
      const results = [];
      for (const saat of validSaatler) {
        try {
          // Negatif ID'ler (geçici) vs pozitif ID'ler (var olan kayıtlar)
          if (saat.id && typeof saat.id === 'number' && saat.id > 0) {
            // Var olan kaydı güncelle
            const updateData = {
              gun: saat.gun,
              acilis: saat.kapali ? null : (saat.acilis || "09:00"),
              kapanis: saat.kapali ? null : (saat.kapanis || "18:00"),
              kapali: saat.kapali || false,
              dukkan_id: saat.dukkan_id || 0
            };
            
            const { data, error } = await supabase
              .from('calisma_saatleri')
              .update(updateData)
              .eq('id', saat.id)
              .select()
              .single();
              
            if (error) {
              console.error(`ID ${saat.id} güncelleme hatası:`, error);
            } else if (data) {
              results.push(data);
            }
          } else {
            // Var olan bir kayıt var mı kontrol et
            const { data: existingData, error: checkError } = await supabase
              .from('calisma_saatleri')
              .select('id')
              .eq('dukkan_id', saat.dukkan_id)
              .eq('gun', saat.gun);
              
            if (checkError) {
              console.error("Var olan kayıt kontrolü hatası:", checkError);
            }
            
            if (existingData && existingData.length > 0) {
              // Var olan kaydı güncelle
              const updateData = {
                acilis: saat.kapali ? null : (saat.acilis || "09:00"),
                kapanis: saat.kapali ? null : (saat.kapanis || "18:00"),
                kapali: saat.kapali || false,
              };
              
              const { data, error } = await supabase
                .from('calisma_saatleri')
                .update(updateData)
                .eq('id', existingData[0].id)
                .select()
                .single();
                
              if (error) {
                console.error(`ID ${existingData[0].id} güncelleme hatası:`, error);
              } else if (data) {
                results.push(data);
              }
            } else {
              // Yeni kayıt oluştur
              const newData = {
                gun: saat.gun,
                acilis: saat.kapali ? null : (saat.acilis || "09:00"),
                kapanis: saat.kapali ? null : (saat.kapanis || "18:00"),
                kapali: saat.kapali || false,
                dukkan_id: saat.dukkan_id || 0
              };
              
              const { data, error } = await supabase
                .from('calisma_saatleri')
                .insert([newData])
                .select();
                
              if (error) {
                console.error(`Yeni çalışma saati ekleme hatası:`, error);
              } else if (data && data.length > 0) {
                results.push(data[0]);
              }
            }
          }
        } catch (err) {
          console.error(`Gün ${saat.gun} işlenirken hata:`, err);
        }
      }
      
      console.log("Güncelleme sonucu:", results);
      
      // Günleri sırala
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
      
      // Kapalı günler için null değerleri doğru şekilde işle
      const updateData: Partial<CalismaSaati> = { ...updates };
      
      if (updateData.kapali) {
        updateData.acilis = null;
        updateData.kapanis = null;
      }
      
      console.log("Final güncelleme verileri:", updateData);
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(updateData)
        .eq('id', id)
        .select()
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
      // Veriyi doğrula
      if (!saat.gun) {
        throw new Error("Gün bilgisi gerekli");
      }
      
      console.log("Yeni çalışma saati eklenecek:", saat);
      
      // dukkan_id yoksa 0 varsayılan değerini kullan
      const saatObj = {
        ...saat,
        dukkan_id: saat.dukkan_id !== undefined ? saat.dukkan_id : 0
      };
      
      // Bu gün için zaten bir kayıt var mı kontrol et
      const { data: existingData, error: checkError } = await supabase
        .from('calisma_saatleri')
        .select('id')
        .eq('dukkan_id', saatObj.dukkan_id)
        .eq('gun', saatObj.gun);
        
      if (checkError) {
        console.error("Var olan kayıt kontrolü hatası:", checkError);
      }
      
      if (existingData && existingData.length > 0) {
        // Var olan kaydı güncelle
        return await this.tekGuncelle(existingData[0].id, saatObj);
      }
      
      // Yeni kayıt oluştur
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert([saatObj])
        .select();

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
        // Veri tabanına varsayılan saatleri ekle
        console.log("Dükkan için kayıtlı çalışma saati bulunamadı, varsayılan değerler kullanılacak");
        return this.getDefaultWorkingHours(dukkanId);
      }
      
      // Günleri sırala
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
  
  // Veritabanı işlemleri olmadan varsayılan çalışma saatlerini al
  getDefaultWorkingHours(dukkanId: number) {
    return gunSiralama.map((gun, index) => ({
      id: -(index + 1), // Geçici kayıtlar için negatif ID'ler
      gun,
      acilis: "09:00",
      kapanis: "18:00",
      kapali: gun === "pazar", // Pazar günleri varsayılan olarak kapalı
      dukkan_id: dukkanId
    }));
  }
};
