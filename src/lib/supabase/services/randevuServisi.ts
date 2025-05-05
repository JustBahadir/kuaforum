
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  // İşletmeye göre randevuları getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Tarihe göre randevuları getir
  async tariheGoreGetir(isletmeKimlik: string, tarih: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .eq('tarih', tarih)
        .order('saat', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tarih randevuları getirilirken hata:', error);
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
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Personel randevuları getirilirken hata:', error);
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
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Müşteri randevuları getirilirken hata:', error);
      return [];
    }
  },
  
  // Randevu oluştur
  async olustur(randevu: Partial<Randevu>): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevu])
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
  async guncelle(randevuKimlik: string, randevu: Partial<Randevu>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .update(randevu)
        .eq('kimlik', randevuKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Randevu güncellenirken hata:', error);
      return false;
    }
  },
  
  // Randevu durumu güncelle
  async durumGuncelle(randevuKimlik: string, durum: string): Promise<boolean> {
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
  }
};

