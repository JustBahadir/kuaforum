import { supabase, supabaseAdmin } from '../client';
import { Randevu } from '../types';
import { toast } from 'sonner';
import { personelIslemleriServisi } from './personelIslemleriServisi';
import { islemServisi } from './islemServisi';
import { personelServisi } from './personelServisi';
import { musteriServisi } from './musteriServisi';

export const randevuServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .order('tarih', { ascending: false });

      if (error) {
        console.error("Randevular getirilirken hata oluştu:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Randevular getirilirken hata oluştu:", error);
      return [];
    }
  },

  async getirById(id: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Randevu #${id} getirilirken hata oluştu:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Randevu #${id} getirilirken hata oluştu:`, error);
      throw error;
    }
  },

  async ekle(randevu: Omit<Randevu, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevu])
        .select()
        .single();

      if (error) {
        console.error("Randevu eklenirken hata oluştu:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Randevu eklenirken hata oluştu:", error);
      throw error;
    }
  },

  async guncelle(id: number, updates: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Randevu #${id} güncellenirken hata oluştu:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Randevu #${id} güncellenirken hata oluştu:`, error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Randevu #${id} silinirken hata oluştu:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Randevu #${id} silinirken hata oluştu:`, error);
      throw error;
    }
  },

  async musteriyeGoreRandevulariGetir(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: false });

      if (error) {
        console.error(`Müşteri #${musteriId} için randevular getirilirken hata oluştu:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Müşteri #${musteriId} için randevular getirilirken hata oluştu:`, error);
      return [];
    }
  },

  async personeleGoreRandevulariGetir(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('personel_id', personelId)
        .order('tarih', { ascending: false });

      if (error) {
        console.error(`Personel #${personelId} için randevular getirilirken hata oluştu:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Personel #${personelId} için randevular getirilirken hata oluştu:`, error);
      return [];
    }
  },

  async tarihAraliginaGoreRandevulariGetir(from: string, to: string) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .gte('tarih', from)
        .lte('tarih', to)
        .order('tarih', { ascending: false });

      if (error) {
        console.error(`Tarih aralığına göre randevular getirilirken hata oluştu:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Tarih aralığına göre randevular getirilirken hata oluştu:`, error);
      return [];
    }
  }
};

// Randevu durum güncelleme
export async function randevuDurumGuncelle(id: number, durum: string) {
  try {
    console.log(`Randevu #${id} durumu güncelleniyor: ${durum}`);
    
    // Update the appointment status
    const { data, error } = await supabase
      .from('randevular')
      .update({ durum })
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      throw error;
    }
    
    console.log(`Randevu durumu güncellendi:`, data);
    
    // If the appointment is marked as completed, create personnel operations
    if (durum === 'tamamlandi') {
      try {
        console.log("Tamamlanan randevu için personel işlemleri oluşturuluyor...");
        
        const randevu = data as Randevu;
        
        // Get appointment details
        const { personel_id, musteri_id, islemler: islemIdsJson } = randevu;
        
        if (!personel_id) {
          console.warn("Randevuda personel atanmamış, işlem kaydı oluşturulamıyor.");
          return data;
        }
        
        if (!islemIdsJson || islemIdsJson.length === 0) {
          console.warn("Randevuda işlem seçilmemiş, işlem kaydı oluşturulamıyor.");
          return data;
        }
        
        // Parse işlemler array
        const islemIds = Array.isArray(islemIdsJson) ? islemIdsJson : JSON.parse(islemIdsJson as any);
        
        if (!islemIds || islemIds.length === 0) {
          console.warn("Geçerli işlem bulunamadı.");
          return data;
        }
        
        // Get personnel details
        const personel = await personelServisi.getirById(personel_id);
        if (!personel) {
          console.warn(`Personel bilgisi bulunamadı (ID: ${personel_id})`);
          return data;
        }
        
        // Get customer info
        let musteriAdi = "Belirtilmemiş Müşteri";
        if (musteri_id) {
          const musteri = await musteriServisi.getirById(musteri_id);
          if (musteri) {
            musteriAdi = `${musteri.first_name || ''} ${musteri.last_name || ''}`.trim();
          }
        }
        
        // Get service details and create operations
        for (const islemId of islemIds) {
          try {
            const islem = await islemServisi.getirById(islemId);
            
            if (!islem) {
              console.warn(`İşlem bilgisi bulunamadı (ID: ${islemId})`);
              continue;
            }
            
            const tutar = Number(islem.fiyat) || 0;
            const primYuzdesi = Number(personel.prim_yuzdesi) || 0;
            const odenen = (tutar * primYuzdesi) / 100;
            const puan = Number(islem.puan) || 0;
            
            // Create operation record
            await personelIslemleriServisi.ekle({
              personel_id,
              islem_id: islemId,
              musteri_id,
              tutar,
              puan,
              prim_yuzdesi: primYuzdesi,
              odenen,
              aciklama: `${islem.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${randevu.id})`,
              notlar: randevu.notlar,
              randevu_id: randevu.id
            });
            
            console.log(`${islem.islem_adi} işlemi için personel işlemi kaydedildi.`);
          } catch (opError) {
            console.error("İşlem kaydı oluşturma hatası:", opError);
            toast.error("İşlem kaydı oluşturulurken bir hata oluştu. Lütfen sistem yöneticinize başvurun.");
            throw opError;
          }
        }
        
        // Update shop statistics
        await personelIslemleriServisi.updateShopStatistics();
        
        console.log("Tüm işlemler başarıyla kaydedildi.");
      } catch (err) {
        console.error("İşlem kayıtları oluşturulurken hata:", err);
        toast.error("İşlem kayıtları oluşturulurken bir hata oluştu.");
      }
    }
    
    return data;
  } catch (error) {
    console.error('Randevu durumu güncellenirken hata:', error);
    throw error;
  }
}

// Staff tarafından randevu durumu güncelleme 
export async function staffRandevuDurumGuncelle(id: number, durum: string) {
  try {
    console.log(`Staff randevu #${id} durumu güncelleniyor: ${durum}`);
    
    const { data, error } = await supabase
      .rpc('update_appointment_status', { 
        appointment_id: id, 
        new_status: durum 
      });
      
    if (error) {
      console.error("Randevu durumu güncellenirken hata:", error);
      throw error;
    }
    
    console.log(`Staff randevu durumu güncellendi:`, data);
    
    // İşlem tamamlandı olarak işaretlendiyse, personel işlemi oluştur
    if (durum === 'tamamlandi') {
      try {
        console.log("Tamamlanan randevu için personel işlemleri oluşturuluyor...");
        
        // Randevu detaylarını getir
        const { data: randevu, error: randevuError } = await supabase
          .from('randevular')
          .select('*')
          .eq('id', id)
          .single();
          
        if (randevuError || !randevu) {
          console.error("Randevu bilgileri alınamadı:", randevuError);
          return data;
        }
        
        const { personel_id, musteri_id, islemler: islemIdsJson } = randevu;
        
        if (!personel_id) {
          console.warn("Randevuda personel atanmamış, işlem kaydı oluşturulamıyor.");
          return data;
        }
        
        if (!islemIdsJson || islemIdsJson.length === 0) {
          console.warn("Randevuda işlem seçilmemiş, işlem kaydı oluşturulamıyor.");
          return data;
        }
        
        // Parse işlemler array
        const islemIds = Array.isArray(islemIdsJson) ? islemIdsJson : JSON.parse(islemIdsJson as any);
        
        if (!islemIds || islemIds.length === 0) {
          console.warn("Geçerli işlem bulunamadı.");
          return data;
        }
        
        // Get personnel details
        const personel = await personelServisi.getirById(personel_id);
        if (!personel) {
          console.warn(`Personel bilgisi bulunamadı (ID: ${personel_id})`);
          return data;
        }
        
        // Get customer info
        let musteriAdi = "Belirtilmemiş Müşteri";
        if (musteri_id) {
          const musteri = await musteriServisi.getirById(musteri_id);
          if (musteri) {
            musteriAdi = `${musteri.first_name || ''} ${musteri.last_name || ''}`.trim();
          }
        }
        
        // Get service details and create operations
        for (const islemId of islemIds) {
          try {
            const islem = await islemServisi.getirById(islemId);
            
            if (!islem) {
              console.warn(`İşlem bilgisi bulunamadı (ID: ${islemId})`);
              continue;
            }
            
            const tutar = Number(islem.fiyat) || 0;
            const primYuzdesi = Number(personel.prim_yuzdesi) || 0;
            const odenen = (tutar * primYuzdesi) / 100;
            const puan = Number(islem.puan) || 0;
            
            // Önce işlemin zaten var olup olmadığını kontrol et
            const { data: existingOp } = await supabase
              .from('personel_islemleri')
              .select('id')
              .eq('randevu_id', id)
              .eq('islem_id', islemId)
              .eq('personel_id', personel_id);
              
            if (existingOp && existingOp.length > 0) {
              console.log(`İşlem zaten kaydedilmiş, güncelleniyor: ${islem.islem_adi}`);
              
              // Update existing operation
              await supabase
                .from('personel_islemleri')
                .update({
                  tutar,
                  puan,
                  prim_yuzdesi: primYuzdesi,
                  odenen,
                  aciklama: `${islem.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${id})`,
                  notlar: randevu.notlar
                })
                .eq('id', existingOp[0].id);
            } else {
              console.log(`Yeni işlem kaydediliyor: ${islem.islem_adi}`);
              
              // Create operation record
              await personelIslemleriServisi.ekle({
                personel_id,
                islem_id: islemId,
                musteri_id,
                tutar,
                puan,
                prim_yuzdesi: primYuzdesi,
                odenen,
                aciklama: `${islem.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${id})`,
                notlar: randevu.notlar,
                randevu_id: id
              });
            }
            
            console.log(`${islem.islem_adi} işlemi için personel işlemi kaydedildi.`);
          } catch (opError) {
            console.error("İşlem kaydı oluşturma hatası:", opError);
            toast.error("İşlem kaydı oluşturulurken bir hata oluştu. Lütfen sistem yöneticinize başvurun.");
            throw opError;
          }
        }
        
        // Update shop statistics
        await personelIslemleriServisi.updateShopStatistics();
        
        console.log("Tüm işlemler başarıyla kaydedildi.");
      } catch (err) {
        console.error("İşlem kayıtları oluşturulurken hata:", err);
        toast.error("İşlem kayıtları oluşturulurken bir hata oluştu.");
      }
    }
    
    return data;
  } catch (error) {
    console.error('Staff randevu durumu güncellenirken hata:', error);
    throw error;
  }
}
