
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  // Personele göre işlem listesi
  async personeleGoreGetir(personelId: number): Promise<PersonelIslemi[]> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('personel_id', personelId);
      
      if (error) throw error;
      
      return data as PersonelIslemi[];
    } catch (error) {
      console.error('Personel işlemleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteriye göre işlem listesi
  async musteriyeGoreGetir(musteriId: string | number): Promise<PersonelIslemi[]> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*')
        .eq('musteri_id', musteriId);
      
      if (error) throw error;
      
      return data as PersonelIslemi[];
    } catch (error) {
      console.error('Müşteri işlemleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Yeni işlem oluştur
  async olustur(islem: Partial<PersonelIslemi>): Promise<PersonelIslemi | null> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islem])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as PersonelIslemi;
    } catch (error) {
      console.error('İşlem oluşturulurken hata:', error);
      return null;
    }
  },
  
  // İşlem güncelle
  async guncelle(islemId: number, islem: Partial<PersonelIslemi>): Promise<PersonelIslemi | null> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .update(islem)
        .eq('id', islemId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as PersonelIslemi;
    } catch (error) {
      console.error('İşlem güncellenirken hata:', error);
      return null;
    }
  },
  
  // İşlem sil
  async sil(islemId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', islemId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
      return false;
    }
  },
  
  // Müşteri işlemlerini getir
  async musteriIslemleriniGetir(musteriId: string | number): Promise<PersonelIslemi[]> {
    return this.musteriyeGoreGetir(musteriId);
  },
  
  // Personel işlemlerini getir (compatibility with older code)
  async personelIslemleriniGetir(personelId: number): Promise<PersonelIslemi[]> {
    return this.personeleGoreGetir(personelId);
  },
  
  // Tüm işlemleri getir
  async hepsiniGetir(): Promise<PersonelIslemi[]> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select('*');
      
      if (error) throw error;
      
      return data as PersonelIslemi[];
    } catch (error) {
      console.error('Tüm işlemler getirilirken hata:', error);
      return [];
    }
  }
};
