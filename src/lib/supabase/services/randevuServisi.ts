
import { supabase } from '../client';
import { Randevu, RandevuDurum } from '../types';

export const randevuServisi = {
  // İşletmeye göre randevuları getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .order('tarih', { ascending: false });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Tarihe göre işletme randevularını getir
  async tariheGoreGetir(isletmeKimlik: string, tarih: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .eq('tarih', tarih)
        .order('saat');
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tarihe göre randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Personele göre randevuları getir
  async personeleGoreGetir(personelKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('personel_kimlik', personelKimlik)
        .order('tarih', { ascending: false });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Personele göre randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteriye göre randevuları getir
  async musteriyeGoreGetir(musteriKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('musteri_kimlik', musteriKimlik)
        .order('tarih', { ascending: false });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Müşteriye göre randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Kimliğe göre randevu getir
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
      console.error('Randevu getirilirken hata:', error);
      return null;
    }
  },
  
  // Yeni randevu oluştur
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
      console.error('Randevu oluşturulurken hata:', error);
      return null;
    }
  },
  
  // Randevu güncelle
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
      console.error('Randevu güncellenirken hata:', error);
      return null;
    }
  },
  
  // Randevu durumunu güncelle
  async durumGuncelle(randevuKimlik: string, durum: RandevuDurum): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('kimlik', randevuKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata:', error);
      return false;
    }
  },
  
  // Randevu sil
  async sil(randevuKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('kimlik', randevuKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
      return false;
    }
  },

  // Müşteriye göre randevuları getir (eski adıyla uyumluluk)
  async getirByMusteriId(musteriId: string): Promise<Randevu[]> {
    return this.musteriyeGoreGetir(musteriId);
  }
};
