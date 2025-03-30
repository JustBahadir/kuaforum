
import { supabase } from '../client';
import { Randevu } from '../types';
import { toast } from 'sonner';
import { personelIslemleriServisi } from './personelIslemleriServisi';

export const randevuServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Randevular getirme hatası:", error);
        throw error;
      }
      
      return data || [];
    } catch (err) {
      console.error("Randevular getirme hatası:", err);
      throw err;
    }
  },

  async dukkanRandevulariniGetir(dukkanId: number) {
    if (!dukkanId) {
      console.error("Geçersiz dükkan ID:", dukkanId);
      throw new Error("Dükkan ID gereklidir");
    }

    try {
      console.log(`Dükkan ID ${dukkanId} için randevular getiriliyor...`);
      
      const { data, error } = await supabase
        .rpc('get_appointments_by_dukkan', { p_dukkan_id: dukkanId });
        
      if (error) {
        console.error("Dükkan randevuları getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} adet randevu bulundu`);
      return data || [];
    } catch (err) {
      console.error("Dükkan randevuları getirme hatası:", err);
      throw err;
    }
  },

  async kendiRandevulariniGetir() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Oturum açmış kullanıcı bulunamadı");
      }

      console.log(`Customer ID ${user.id} için randevular getiriliyor...`);
      
      const { data, error } = await supabase
        .rpc('get_customer_appointments', { p_customer_id: user.id });
        
      if (error) {
        console.error("Kendi randevularını getirme hatası:", error);
        throw error;
      }
      
      console.log(`${data?.length || 0} adet randevu bulundu`);
      return data || [];
    } catch (err) {
      console.error("Kendi randevularını getirme hatası:", err);
      throw err;
    }
  },

  async ekle(randevu: Omit<Randevu, 'id' | 'created_at'>) {
    console.log("Randevu ekle başlangıç, alınan veri:", randevu);
    
    if (!randevu.dukkan_id) {
      throw new Error("Dükkan seçimi zorunludur");
    }
    
    if (!randevu.personel_id) {
      throw new Error("Personel seçimi zorunludur");
    }
    
    if (!randevu.tarih || !randevu.saat) {
      throw new Error("Tarih ve saat seçimi zorunludur");
    }

    const islemler = Array.isArray(randevu.islemler) 
      ? randevu.islemler 
      : (randevu.islemler ? [randevu.islemler] : []);
      
    if (islemler.length === 0) {
      throw new Error("En az bir hizmet seçmelisiniz");
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Oturum açmış kullanıcı bulunamadı");
      }
      
      const { data, error } = await supabase
        .rpc('insert_appointment', {
          p_dukkan_id: randevu.dukkan_id,
          p_musteri_id: randevu.musteri_id || null,
          p_personel_id: randevu.personel_id,
          p_tarih: randevu.tarih,
          p_saat: randevu.saat,
          p_durum: randevu.durum || "onaylandi",
          p_islemler: islemler,
          p_notlar: randevu.notlar || "",
          p_customer_id: user.id
        });
      
      if (error) {
        console.error("Randevu ekleme hatası:", error);
        throw new Error(`Randevu eklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      }
      
      console.log("Randevu başarıyla oluşturuldu:", data);
      toast.success("Randevu başarıyla oluşturuldu");
      return data;
    } catch (error: any) {
      console.error("Randevu oluşturma hatası:", error);
      toast.error(error?.message || "Randevu oluşturulurken bir hata oluştu");
      throw new Error(error?.message || "Randevu oluşturulurken bir hata oluştu");
    }
  },

  async guncelle(id: number, randevu: Partial<Randevu>) {
    if (!id) {
      throw new Error("Randevu ID gereklidir");
    }
    
    try {
      console.log(`Randevu ${id} güncelleniyor:`, randevu);
      
      if (randevu.durum && Object.keys(randevu).length === 1) {
        const { data, error } = await supabase
          .rpc('update_appointment_status', { 
            appointment_id: id, 
            new_status: randevu.durum 
          });
          
        if (error) {
          console.error("Randevu durumu güncelleme hatası:", error);
          throw new Error(`Randevu güncellenirken bir hata oluştu: ${error.message}`);
        }
        
        console.log("Randevu güncelleme başarılı:", data);
        
        if (randevu.durum === "tamamlandi") {
          try {
            console.log(`Randevu ${id} tamamlandı olarak işaretlendi, işlemler oluşturuluyor...`);
            const operationResults = await this.randevuTamamlandi(id);
            console.log(`İşlem kayıtları oluşturuldu:`, operationResults);
            return { ...data, operationResults };
          } catch (opError) {
            console.error("İşlem kaydı oluşturma hatası:", opError);
            toast.error("İşlem kaydı oluşturulurken bir hata oluştu. Lütfen sistem yöneticinize başvurun.");
            throw opError; // Rethrow to ensure the caller knows there was an error
          }
        }
        
        return data;
      } else {
        const { data, error } = await supabase
          .from('randevular')
          .update(randevu)
          .eq('id', id)
          .select('*');

        if (error) {
          console.error("Randevu güncelleme hatası:", error);
          throw new Error(`Randevu güncellenirken bir hata oluştu: ${error.message}`);
        }
        
        console.log("Randevu güncelleme başarılı:", data);
        
        if (randevu.durum === "tamamlandi") {
          try {
            console.log(`Randevu ${id} tamamlandı olarak işaretlendi, işlemler oluşturuluyor...`);
            const operationResults = await this.randevuTamamlandi(id);
            console.log(`İşlem kayıtları oluşturuldu:`, operationResults);
            return { ...data[0], operationResults };
          } catch (opError) {
            console.error("İşlem kaydı oluşturma hatası:", opError);
            toast.error("İşlem kaydı oluşturulurken bir hata oluştu. Lütfen sistem yöneticinize başvurun.");
            throw opError; // Rethrow to ensure the caller knows there was an error
          }
        }
        
        return data && data.length > 0 ? data[0] : null;
      }
    } catch (error: any) {
      console.error("Randevu güncelleme hatası:", error);
      throw new Error(error?.message || "Randevu güncellenirken bir hata oluştu");
    }
  },

  async randevuTamamlandi(randevuId: number) {
    try {
      console.log(`Randevu ${randevuId} tamamlandı işlemi başlatılıyor...`);
      
      // Randevu detaylarını getir
      const { data: randevu, error: randevuError } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('id', randevuId)
        .single();
        
      if (randevuError || !randevu) {
        console.error("Randevu bilgileri alınamadı:", randevuError);
        throw new Error(`Randevu bilgileri alınamadı: ${randevuError?.message || 'Randevu bulunamadı'}`);
      }
      
      console.log("Retrieved appointment details:", randevu);
      
      // İşlem ID'lerini kontrol et
      const islemIds = randevu.islemler || [];
      if (!islemIds || islemIds.length === 0) {
        console.error("Randevuda kayıtlı işlem bulunamadı");
        throw new Error("Randevuda kayıtlı işlem bulunamadı");
      }
      
      console.log("Service IDs from appointment:", islemIds);
      
      // İşlem detaylarını getir
      const { data: islemler, error: islemError } = await supabase
        .from('islemler')
        .select('*')
        .in('id', islemIds);
      
      if (islemError || !islemler || islemler.length === 0) {
        console.error("İşlem detayları alınamadı:", islemError);
        throw new Error(`İşlem detayları alınamadı: ${islemError?.message || 'İşlemler bulunamadı'}`);
      }
      
      console.log(`${islemler.length} adet işlem işlenecek:`, islemler);
      
      // Personel bilgilerini kontrol et
      if (!randevu.personel || !randevu.personel_id) {
        console.error("Personel bilgisi bulunamadı");
        throw new Error("Personel bilgisi bulunamadı");
      }
      
      const personelData = randevu.personel;
      const primYuzdesi = personelData?.prim_yuzdesi || 0;
      
      console.log("Personel data:", personelData);
      console.log("Prim yüzdesi:", primYuzdesi);
      
      // Müşteri adını oluştur
      let musteriAdi = "Belirtilmemiş";
      if (randevu.musteri) {
        musteriAdi = `${randevu.musteri.first_name || ''} ${randevu.musteri.last_name || ''}`.trim();
      }
      
      // İşlemleri kaydet
      const createdOperations = [];
      for (const islem of islemler) {
        try {
          const tutar = parseFloat(islem.fiyat) || 0;
          const odenenPrim = (tutar * primYuzdesi) / 100;
          
          const personelIslem = {
            personel_id: randevu.personel_id,
            islem_id: islem.id,
            tutar: tutar,
            puan: parseInt(islem.puan) || 0,
            prim_yuzdesi: primYuzdesi,
            odenen: odenenPrim,
            musteri_id: randevu.musteri_id,
            randevu_id: randevuId,
            aciklama: `${islem.islem_adi} hizmeti verildi - ${musteriAdi} (Randevu #${randevuId})`,
            notlar: randevu.notlar || ''
          };
          
          console.log("Creating personnel operation:", personelIslem);
          
          // Mevcut kayıt var mı kontrol et
          const { data: existingOps, error: checkError } = await supabase
            .from('personel_islemleri')
            .select('id')
            .eq('randevu_id', randevuId)
            .eq('islem_id', islem.id)
            .eq('personel_id', randevu.personel_id);
            
          if (checkError) {
            console.error("Error checking for existing operations:", checkError);
          }
          
          if (existingOps && existingOps.length > 0) {
            console.log(`İşlem zaten var, güncelleniyor: ${existingOps[0].id}`);
            
            // Mevcut kayıt varsa güncelle
            const result = await personelIslemleriServisi.guncelle(existingOps[0].id, personelIslem);
            
            if (result) {
              createdOperations.push(result);
              console.log("Updated existing operation:", result);
            }
          } else {
            // Yeni kayıt oluştur
            const createdOp = await personelIslemleriServisi.ekle(personelIslem);
            
            if (createdOp) {
              createdOperations.push(createdOp);
              console.log("Created new personnel operation:", createdOp);
            }
          }
        } catch (serviceError) {
          console.error(`Error processing service ID ${islem.id}:`, serviceError);
        }
      }
      
      console.log(`Toplam ${createdOperations.length} adet işlem kaydı oluşturuldu`);
      
      if (createdOperations.length > 0) {
        toast.success(`Randevu tamamlandı ve ${createdOperations.length} işlem kaydedildi`);
      } else {
        toast.warning("Randevu tamamlandı ancak işlem kaydedilemedi");
      }
      
      return createdOperations;
    } catch (error: any) {
      console.error("Randevu tamamlandı işlemi hatası:", error);
      toast.error(`İşlem kaydedilemedi: ${error.message}`);
      throw error;
    }
  },

  async sil(id: number) {
    if (!id) {
      throw new Error("Randevu ID gereklidir");
    }
    
    try {
      console.log(`Randevu ${id} siliniyor`);
      
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Randevu silme hatası:", error);
        throw new Error(`Randevu silinirken bir hata oluştu: ${error.message}`);
      }
      
      console.log(`Randevu ${id} başarıyla silindi`);
      return true;
    } catch (error: any) {
      console.error("Randevu silme hatası:", error);
      throw new Error(error?.message || "Randevu silinirken bir hata oluştu");
    }
  }
};
