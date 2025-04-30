
import { supabase } from "@/lib/supabase/client";
import { PersonelIslemi } from "../types";

export const personelIslemleriServisi = {
  hepsiniGetir: async () => {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        personel:personel_id (id, ad_soyad),
        musteri:musteri_id (id, first_name, last_name, phone),
        islem:islem_id (id, islem_adi, fiyat, kategori_id)
      `);

    if (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }

    return data || [];
  },

  getir: async (id: number) => {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        personel:personel_id (id, ad_soyad),
        musteri:musteri_id (id, first_name, last_name, phone),
        islem:islem_id (id, islem_adi, fiyat, kategori_id)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Personel işlemi getirme hatası:', error);
      throw error;
    }

    return data;
  },

  personelIslemleriGetir: async (personelId: number) => {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        personel:personel_id (id, ad_soyad),
        musteri:musteri_id (id, first_name, last_name, phone),
        islem:islem_id (id, islem_adi, fiyat, kategori_id)
      `)
      .eq('personel_id', personelId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }

    return data || [];
  },

  // Add the missing method for fetching operations by customer ID
  getirByMusteriId: async (musteriId: number) => {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        personel:personel_id (id, ad_soyad),
        musteri:musteri_id (id, first_name, last_name, phone),
        islem:islem_id (id, islem_adi, fiyat, kategori_id)
      `)
      .eq('musteri_id', musteriId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Müşteri işlemleri getirme hatası:', error);
      throw error;
    }

    return data || [];
  },

  ekle: async (data: any) => {
    const { data: result, error } = await supabase
      .from('personel_islemleri')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }

    await personelIslemleriServisi.updateShopStatistics();

    return result;
  },

  guncelle: async (id: number, data: any) => {
    const { data: result, error } = await supabase
      .from('personel_islemleri')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Personel işlemi güncelleme hatası:', error);
      throw error;
    }

    await personelIslemleriServisi.updateShopStatistics();

    return result;
  },

  sil: async (id: number) => {
    const { error } = await supabase
      .from('personel_islemleri')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Personel işlemi silme hatası:', error);
      throw error;
    }

    await personelIslemleriServisi.updateShopStatistics();

    return true;
  },

  personelPerformansRaporu: async (personelId: number, startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .rpc('personel_performans_raporu', { 
        p_personel_id: personelId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) {
      console.error('Personel performans raporu hatası:', error);
      throw error;
    }

    return data || [];
  },

  updateShopStatistics: async () => {
    try {
      // İşletme istatistiklerini güncelleme işlevi
      // Bu fonksiyon Supabase'de tanımlı bir RPC olabilir veya basit bir yenileme işlemi yapabilir
      console.log("Dükkan istatistikleri güncelleniyor...");
      return true;
    } catch (error) {
      console.error("Dükkan istatistiklerini güncelleme hatası:", error);
      return false;
    }
  }
};
