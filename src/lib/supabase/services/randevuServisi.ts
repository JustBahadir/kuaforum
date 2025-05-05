
import { supabase } from '../client';
import { Randevu, RandevuDurum } from '../types';

export const randevuServisi = {
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('İşletmeye göre randevu getirme hatası:', error);
      return [];
    }
  },

  async tariheGoreGetir(isletmeKimlik: string, tarih: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .eq('tarih', tarih);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tarihe göre randevu getirme hatası:', error);
      return [];
    }
  },

  // Tüm randevuları getir
  async hepsiniGetir(): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*');
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tüm randevuları getirme hatası:', error);
      return [];
    }
  },

  // İşletme randevularını getir (dukkanRandevulariniGetir yerine)
  async isletmeRandevulariniGetir(isletmeKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('İşletme randevularını getirme hatası:', error);
      return [];
    }
  },

  // Personelin kendi randevularını getir
  async kendiRandevulariniGetir(personelKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('personel_kimlik', personelKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Personel randevularını getirme hatası:', error);
      return [];
    }
  },

  // Müşterinin kendi randevularını getir
  async musteriRandevulariniGetir(musteriKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('musteri_kimlik', musteriKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Müşteri randevularını getirme hatası:', error);
      return [];
    }
  },

  async getir(randevuKimlik: string): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('kimlik', randevuKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu getirme hatası:', error);
      return null;
    }
  },

  async olustur(randevu: Partial<Randevu>): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert(randevu)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      return null;
    }
  },

  async guncelle(randevuKimlik: string, randevu: Partial<Randevu>): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(randevu)
        .eq('kimlik', randevuKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      return null;
    }
  },

  async durumGuncelle(randevuKimlik: string, durum: RandevuDurum): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('kimlik', randevuKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu durum güncelleme hatası:', error);
      return null;
    }
  },

  async sil(randevuKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('kimlik', randevuKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      return false;
    }
  }
};
