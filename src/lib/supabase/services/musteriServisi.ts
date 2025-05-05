
import { supabase } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // İşletmeye göre müşterileri getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Musteri[]> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Musteri[];
    } catch (error) {
      console.error('Müşteriler getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteri detayını getir
  async getir(musteriKimlik: string): Promise<Musteri | null> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('kimlik', musteriKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Musteri;
    } catch (error) {
      console.error('Müşteri getirilirken hata:', error);
      return null;
    }
  },
  
  // Müşteri oluştur
  async olustur(musteri: Partial<Musteri>): Promise<Musteri | null> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .insert([musteri])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Musteri;
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error);
      return null;
    }
  },
  
  // Müşteri güncelle
  async guncelle(musteriKimlik: string, musteri: Partial<Musteri>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('musteriler')
        .update(musteri)
        .eq('kimlik', musteriKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
      return false;
    }
  },
  
  // Müşteri sil
  async sil(musteriKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('musteriler')
        .delete()
        .eq('kimlik', musteriKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
      return false;
    }
  }
};

