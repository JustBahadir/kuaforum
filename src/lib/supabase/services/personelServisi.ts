
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Personel[]> {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Personel[];
    } catch (error) {
      console.error('İşletme personelleri getirme hatası:', error);
      return [];
    }
  },

  // Tüm personelleri getir
  async hepsiniGetir(): Promise<Personel[]> {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .select('*');
      
      if (error) throw error;
      
      return data as Personel[];
    } catch (error) {
      console.error('Tüm personelleri getirme hatası:', error);
      return [];
    }
  },

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
      console.error('Personel getirme hatası:', error);
      return null;
    }
  },

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
      console.error('Kullanıcı kimliği ile personel getirme hatası:', error);
      return null;
    }
  },

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
          .insert(personel)
          .select()
          .single();
        
        if (error) throw error;
        
        return data as Personel;
      }
    } catch (error) {
      console.error('Personel kaydetme hatası:', error);
      return null;
    }
  },

  // Personel kayıt
  async register(personelData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('personeller')
        .insert(personelData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Personel kayıt hatası:', error);
      throw error;
    }
  }
};
