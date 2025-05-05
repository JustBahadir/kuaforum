
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  // İşletmeye göre personelleri getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Personel[]> {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Personel[];
    } catch (error) {
      console.error('Personeller getirilirken hata:', error);
      return [];
    }
  },
  
  // Personel detayını getir
  async getir(personelKimlik: string): Promise<Personel | null> {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .select('*')
        .eq('kimlik', personelKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Personel;
    } catch (error) {
      console.error('Personel getirilirken hata:', error);
      return null;
    }
  },
  
  // Kullanıcı kimliğine göre personel getir
  async kullaniciKimligiIleGetir(kullaniciKimlik: string): Promise<Personel | null> {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .select('*')
        .eq('kullanici_kimlik', kullaniciKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Personel;
    } catch (error) {
      console.error('Personel kullanıcı kimliği ile getirilirken hata:', error);
      return null;
    }
  },
  
  // Personel kaydet/güncelle
  async kaydet(personel: Partial<Personel>): Promise<Personel | null> {
    try {
      if (personel.kimlik) {
        // Güncelleme
        const { data, error } = await supabase
          .from('personeller')
          .update(personel)
          .eq('kimlik', personel.kimlik)
          .select()
          .single();
        
        if (error) throw error;
        
        return data as Personel;
      } else {
        // Yeni kayıt
        const { data, error } = await supabase
          .from('personeller')
          .insert([personel])
          .select()
          .single();
        
        if (error) throw error;
        
        return data as Personel;
      }
    } catch (error) {
      console.error('Personel kaydedilirken hata:', error);
      return null;
    }
  },
  
  // Personel kayıt
  async register(personelData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personeller')
        .insert([personelData]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Personel kaydı oluşturulurken hata:', error);
      return false;
    }
  }
};

