
import { supabase } from '../client';
import { Musteri } from '../types';

export const musteriServisi = {
  // İşletmeye göre müşteri listesi
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Musteri[]> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*')
        .eq('isletme_id', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Musteri[];
    } catch (error) {
      console.error('Müşteri listesi getirilirken hata:', error);
      return [];
    }
  },
  
  // Tek müşteriyi getir
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
  
  // Tüm müşterileri getir
  async hepsiniGetir(): Promise<Musteri[]> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .select('*');
      
      if (error) throw error;
      
      return data as Musteri[];
    } catch (error) {
      console.error('Tüm müşteriler getirilirken hata:', error);
      return [];
    }
  },
  
  // Kullanıcının işletmesinin müşterilerini getir
  async getCurrentUserIsletmeMusterileri(): Promise<Musteri[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];
      
      const { data: isletme, error: isletmeError } = await supabase
        .from('isletmeler')
        .select('kimlik')
        .eq('sahip_kimlik', user.id)
        .single();
      
      if (isletmeError || !isletme) return [];
      
      return this.isletmeyeGoreGetir(isletme.kimlik);
    } catch (error) {
      console.error('Kullanıcı işletmesi müşterileri getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteri bilgilerini güncelle
  async guncelle(musteriKimlik: string, musteri: Partial<Musteri>): Promise<Musteri | null> {
    try {
      const { data, error } = await supabase
        .from('musteriler')
        .update(musteri)
        .eq('kimlik', musteriKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Musteri;
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
      return null;
    }
  },
  
  // Yeni müşteri oluştur
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
  
  // Müşteri ekle (for compatibility with older code)
  async ekle(musteri: Partial<Musteri>): Promise<Musteri | null> {
    return this.olustur(musteri);
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
