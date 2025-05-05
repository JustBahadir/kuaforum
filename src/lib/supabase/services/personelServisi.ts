
import { supabase } from '../client';
import { Personel } from '../types';

export const personelServisi = {
  // İşletmeye göre personel listesi
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Personel[]> {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('isletme_id', isletmeKimlik);
        
      if (error) throw error;
      
      return data as Personel[];
    } catch (error) {
      console.error('Personel listesi getirilirken hata:', error);
      return [];
    }
  },
  
  // Tüm personelleri getir
  async hepsiniGetir(): Promise<Personel[]> {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*');
        
      if (error) throw error;
      
      return data as Personel[];
    } catch (error) {
      console.error('Tüm personeller getirilirken hata:', error);
      return [];
    }
  },
  
  // Tek personel getir
  async getir(personelKimlik: string): Promise<Personel | null> {
    try {
      const { data, error } = await supabase
        .from('personel')
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
  
  // Personel getir by ID (numeric ID)
  async getirById(personelId: number | string): Promise<Personel | null> {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('id', personelId)
        .single();
        
      if (error) throw error;
      
      return data as Personel;
    } catch (error) {
      console.error('Personel ID ile getirilirken hata:', error);
      return null;
    }
  },
  
  // Kullanıcı kimliği ile personel getir
  async kullaniciKimligiIleGetir(kullaniciKimlik: string): Promise<Personel | null> {
    try {
      const { data, error } = await supabase
        .from('personel')
        .select('*')
        .eq('kullanici_kimlik', kullaniciKimlik)
        .single();
        
      if (error) throw error;
      
      return data as Personel;
    } catch (error) {
      console.error('Kullanıcı kimliği ile personel getirilirken hata:', error);
      return null;
    }
  },
  
  // Personel bilgilerini güncelle veya yeni personel oluştur
  async kaydet(personel: Partial<Personel>): Promise<Personel | null> {
    try {
      let veri;
      let hata;
      
      if (personel.kimlik) {
        // Güncelleme
        const { data, error } = await supabase
          .from('personel')
          .update(personel)
          .eq('kimlik', personel.kimlik)
          .select()
          .single();
          
        veri = data;
        hata = error;
      } else {
        // Yeni personel
        const { data, error } = await supabase
          .from('personel')
          .insert([personel])
          .select()
          .single();
          
        veri = data;
        hata = error;
      }
      
      if (hata) throw hata;
      
      return veri as Personel;
    } catch (error) {
      console.error('Personel kaydedilirken hata:', error);
      return null;
    }
  },
  
  // Personel ekle
  async ekle(personel: Partial<Personel>): Promise<Personel | null> {
    try {
      const { data, error } = await supabase
        .from('personel')
        .insert([personel])
        .select()
        .single();
        
      if (error) throw error;
      
      return data as Personel;
    } catch (error) {
      console.error('Personel eklenirken hata:', error);
      return null;
    }
  },
  
  // Personel sil
  async sil(personelKimlik: string | number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personel')
        .delete()
        .eq(typeof personelKimlik === 'string' ? 'kimlik' : 'id', personelKimlik);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Personel silinirken hata:', error);
      return false;
    }
  },
  
  // Register personel (compatibility with older code)
  async register(personelData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('personel')
        .insert([personelData])
        .select();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Personel kaydı yapılırken hata:', error);
      throw error;
    }
  }
};
