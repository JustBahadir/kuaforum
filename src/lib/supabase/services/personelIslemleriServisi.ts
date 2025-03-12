
import { supabase } from "@/lib/supabase/client";

export const personelIslemleriServisi = {
  /**
   * Tüm personel işlemlerini getirir
   */
  hepsiniGetir: async () => {
    try {
      const { data, error } = await supabase
        .from('personel_islemler')
        .select(`
          *,
          personel:personel_id(id, ad, soyad, auth_id),
          musteri:musteri_id(id, ad, soyad, auth_id),
          islem:islem_id(id, ad, fiyat, sure, puan)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Personel işlemlerini getirirken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Personel işlemlerini getirirken beklenmeyen hata:', error);
      throw error;
    }
  },

  /**
   * Belirli bir personelin işlemlerini getirir
   */
  personelIslemleriGetir: async (personelId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemler')
        .select(`
          *,
          personel:personel_id(id, ad, soyad, auth_id),
          musteri:musteri_id(id, ad, soyad, auth_id),
          islem:islem_id(id, ad, fiyat, sure, puan)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Personel işlemlerini getirirken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Personel işlemlerini getirirken beklenmeyen hata:', error);
      throw error;
    }
  },

  /**
   * Belirli bir personelin belirli tarih aralığındaki işlemlerini getirir
   */
  tarihAraliginaGoreGetir: async (personelId: number, startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemler')
        .select(`
          *,
          personel:personel_id(id, ad, soyad, auth_id),
          musteri:musteri_id(id, ad, soyad, auth_id),
          islem:islem_id(id, ad, fiyat, sure, puan)
        `)
        .eq('personel_id', personelId)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Tarih aralığına göre personel işlemlerini getirirken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Tarih aralığına göre personel işlemlerini getirirken beklenmeyen hata:', error);
      throw error;
    }
  },

  /**
   * Belirli bir müşterinin işlemlerini getirir
   */
  musteriIslemleriGetir: async (musteriId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemler')
        .select(`
          *,
          personel:personel_id(id, ad, soyad, auth_id),
          musteri:musteri_id(id, ad, soyad, auth_id),
          islem:islem_id(id, ad, fiyat, sure, puan)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Müşteri işlemlerini getirirken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Müşteri işlemlerini getirirken beklenmeyen hata:', error);
      throw error;
    }
  },

  /**
   * Yeni bir personel işlemi ekler
   */
  ekle: async (islem: any) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemler')
        .insert([islem])
        .select();

      if (error) {
        console.error('Personel işlemi eklerken hata:', error);
        throw error;
      }

      return data ? data[0] : null;
    } catch (error) {
      console.error('Personel işlemi eklerken beklenmeyen hata:', error);
      throw error;
    }
  },

  /**
   * Randevu ID'sine göre işlem getirir
   */
  getByRandevuId: async (randevuId: number) => {
    try {
      const { data, error } = await supabase
        .from('personel_islemler')
        .select(`
          *,
          personel:personel_id(id, ad, soyad, auth_id),
          musteri:musteri_id(id, ad, soyad, auth_id),
          islem:islem_id(id, ad, fiyat, sure, puan)
        `)
        .eq('randevu_id', randevuId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Randevu ID\'sine göre işlem getirirken hata:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Randevu ID\'sine göre işlem getirirken beklenmeyen hata:', error);
      throw error;
    }
  }
};
