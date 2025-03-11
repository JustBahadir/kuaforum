import { supabase } from '../client';
import { Randevu } from '../types';
import { toast } from 'sonner';

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
      
      // Use the security definer function
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
      
      // Use the security definer function
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
      
      // Use the security definer function for inserting
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
      
      // For status updates, use our specialized function to avoid infinite recursion
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
        
        // If an appointment is marked as completed, create a personnel operation record
        if (randevu.durum === "tamamlandi") {
          try {
            await this.randevuTamamlandi(id);
          } catch (opError) {
            console.error("İşlem kaydı oluşturma hatası:", opError);
            // Don't fail the entire process if operation creation fails
          }
        }
        
        return data;
      } else {
        // For other updates, use the regular update
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
        
        // If an appointment is marked as completed, create a personnel operation record
        if (randevu.durum === "tamamlandi") {
          try {
            await this.randevuTamamlandi(id);
          } catch (opError) {
            console.error("İşlem kaydı oluşturma hatası:", opError);
            // Don't fail the entire process if operation creation fails
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
      // Get the appointment details
      const { data: randevu, error: randevuError } = await supabase
        .from('randevular')
        .select(`
          *,
          islemler:islemler(id, islem_adi, fiyat, puan),
          personel:personel(id, ad_soyad, prim_yuzdesi),
          musteri:musteriler(id, first_name, last_name)
        `)
        .eq('id', randevuId)
        .single();
        
      if (randevuError || !randevu) {
        throw new Error(`Randevu bilgileri alınamadı: ${randevuError?.message || 'Randevu bulunamadı'}`);
      }

      // Insert personnel operation record for each service
      const islemler = Array.isArray(randevu.islemler) ? randevu.islemler : [];
      
      for (const islem of islemler) {
        const personelIslem = {
          personel_id: randevu.personel_id,
          islem_id: islem.id,
          musteri_id: randevu.musteri_id,
          tutar: parseFloat(islem.fiyat),
          odenen: parseFloat(islem.fiyat),
          puan: parseInt(islem.puan),
          prim_yuzdesi: randevu.personel?.prim_yuzdesi || 0,
          aciklama: `${randevu.musteri?.first_name || 'Müşteri'} için ${islem.islem_adi} hizmeti verildi`,
          photos: []
        };
        
        const { error: insertError } = await supabase
          .from('personel_islemleri')
          .insert(personelIslem);
          
        if (insertError) {
          throw new Error(`İşlem kaydedilemedi: ${insertError.message}`);
        }
      }
      
      return true;
    } catch (error: any) {
      console.error("Randevu tamamlandı işlemi hatası:", error);
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
