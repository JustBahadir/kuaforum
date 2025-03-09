
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*, profiles(*), personel(*)')
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
      throw new Error("Dükkan ID gereklidir");
    }

    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*, profiles(*), personel(*)')
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Dükkan randevuları getirme hatası:", error);
        throw error;
      }
      
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

      const { data, error } = await supabase
        .from('randevular')
        .select('*, profiles(*), personel(*)')
        .eq('customer_id', user.id)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Kendi randevularını getirme hatası:", error);
        throw error;
      }
      
      return data || [];
    } catch (err) {
      console.error("Kendi randevularını getirme hatası:", err);
      throw err;
    }
  },

  async ekle(randevu: Omit<Randevu, 'id' | 'created_at' | 'musteri' | 'personel'>) {
    console.log("Randevu ekle başlangıç, alınan veri:", randevu);
    
    if (!randevu.dukkan_id) {
      throw new Error("Dükkan seçimi zorunludur");
    }
    
    if (!randevu.musteri_id) {
      throw new Error("Müşteri seçimi zorunludur");
    }
    
    if (!randevu.personel_id) {
      throw new Error("Personel seçimi zorunludur");
    }
    
    if (!randevu.tarih || !randevu.saat) {
      throw new Error("Tarih ve saat seçimi zorunludur");
    }

    // İşlemleri düzenle - tek işlem bile olsa array olarak sakla
    const islemler = Array.isArray(randevu.islemler) 
      ? randevu.islemler 
      : (randevu.islemler ? [randevu.islemler] : []);
      
    if (islemler.length === 0) {
      throw new Error("En az bir hizmet seçmelisiniz");
    }

    // Kayıt için hazırla
    const insertData = {
      dukkan_id: randevu.dukkan_id,
      musteri_id: randevu.musteri_id,
      personel_id: randevu.personel_id,
      tarih: randevu.tarih,
      saat: randevu.saat,
      durum: randevu.durum || "onaylandi",
      notlar: randevu.notlar || "",
      islemler: islemler,
      customer_id: randevu.customer_id || null
    };
    
    console.log("Eklenen randevu verisi:", insertData);

    try {
      // Randevuyu ekle
      const { data, error } = await supabase
        .from('randevular')
        .insert(insertData)
        .select();

      if (error) {
        console.error("Supabase randevu ekleme hatası:", error);
        throw new Error(error.message || "Randevu eklenirken bir hata oluştu");
      }
      
      if (!data || data.length === 0) {
        throw new Error("Randevu eklendi ancak veri döndürülemedi");
      }
      
      console.log("Randevu başarıyla oluşturuldu:", data[0]);
      
      return data[0];
    } catch (error: any) {
      console.error("Randevu oluşturma hatası:", error);
      throw new Error(error?.message || "Randevu oluşturulurken bir hata oluştu");
    }
  },

  async guncelle(id: number, randevu: Partial<Randevu>) {
    if (!id) {
      throw new Error("Randevu ID gereklidir");
    }
    
    try {
      console.log(`Randevu ${id} güncelleniyor:`, randevu);
      
      const { data, error } = await supabase
        .from('randevular')
        .update(randevu)
        .eq('id', id)
        .select('*, profiles(*), personel(*)');

      if (error) {
        console.error("Randevu güncelleme hatası:", error);
        throw new Error(`Randevu güncellenirken bir hata oluştu: ${error.message}`);
      }
      
      console.log("Randevu güncelleme başarılı:", data);
      return data && data.length > 0 ? data[0] : null;
    } catch (error: any) {
      console.error("Randevu güncelleme hatası:", error);
      throw new Error(error?.message || "Randevu güncellenirken bir hata oluştu");
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
