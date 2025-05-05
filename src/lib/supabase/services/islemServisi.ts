
import { supabase } from '../client';
import { Hizmet } from '../types';

export const islemServisi = {
  // İşlem kategorisine göre işlemleri getir
  async kategoriyeGoreGetir(kategoriKimlik: string): Promise<Hizmet[]> {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_kimlik', kategoriKimlik)
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as Hizmet[];
    } catch (error) {
      console.error('İşlemler getirilirken hata:', error);
      return [];
    }
  },
  
  // İşletmeye göre tüm işlemleri getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Hizmet[]> {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as Hizmet[];
    } catch (error) {
      console.error('İşletme işlemleri getirilirken hata:', error);
      return [];
    }
  },
  
  // İşlem oluştur
  async olustur(islem: Partial<Hizmet>): Promise<Hizmet | null> {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .insert([islem])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Hizmet;
    } catch (error) {
      console.error('İşlem oluşturulurken hata:', error);
      return null;
    }
  },
  
  // İşlem güncelle
  async guncelle(islemKimlik: string, islem: Partial<Hizmet>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('islemler')
        .update(islem)
        .eq('kimlik', islemKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('İşlem güncellenirken hata:', error);
      return false;
    }
  },
  
  // İşlem sil
  async sil(islemKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('kimlik', islemKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
      return false;
    }
  }
};

