
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  async hepsiniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Randevular getirme hatası:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Randevular getirme hatası:", err);
      return [];
    }
  },

  async dukkanRandevulariniGetir(dukkanId: number) {
    if (!dukkanId) return [];

    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('dukkan_id', dukkanId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Dükkan randevuları getirme hatası:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Dükkan randevuları getirme hatası:", err);
      return [];
    }
  },

  async kendiRandevulariniGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .eq('customer_id', user.id)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });

      if (error) {
        console.error("Kendi randevularını getirme hatası:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Kendi randevularını getirme hatası:", err);
      return [];
    }
  },

  async ekle(randevu: Omit<Randevu, 'id' | 'created_at' | 'musteri' | 'personel'>) {
    console.log("Randevu ekle service received data:", randevu);
    
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
      : randevu.islemler ? [randevu.islemler] : [];

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
      customer_id: randevu.customer_id || null // Müşteri ID'si varsa kullan, yoksa null olsun
    };
    
    console.log("Eklenen randevu verisi:", insertData);

    try {
      // Randevuyu ekle
      const { data, error } = await supabase
        .from('randevular')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase randevu ekleme hatası:", error);
        throw new Error("Randevu eklenirken bir hata oluştu: " + error.message);
      }
      
      if (!data) {
        throw new Error("Randevu eklendi ancak veri döndürülemedi");
      }
      
      console.log("Randevu başarıyla oluşturuldu:", data);
      
      return data;
    } catch (error: any) {
      console.error("Randevu oluşturma hatası:", error);
      throw new Error(error?.message || "Randevu oluşturulurken bir hata oluştu");
    }
  },

  async guncelle(id: number, randevu: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(randevu)
        .eq('id', id)
        .select(`
          *,
          musteri:musteriler(*),
          personel:personel(*)
        `)
        .single();

      if (error) {
        console.error("Randevu güncelleme hatası:", error);
        throw new Error("Randevu güncellenirken bir hata oluştu: " + error.message);
      }
      return data;
    } catch (error: any) {
      console.error("Randevu güncelleme hatası:", error);
      throw new Error(error?.message || "Randevu güncellenirken bir hata oluştu");
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Randevu silme hatası:", error);
        throw new Error("Randevu silinirken bir hata oluştu: " + error.message);
      }
    } catch (error: any) {
      console.error("Randevu silme hatası:", error);
      throw new Error(error?.message || "Randevu silinirken bir hata oluştu");
    }
  }
};
