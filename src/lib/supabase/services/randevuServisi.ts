
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  // İşletmeye göre randevu listesi
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_id', isletmeKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Randevu listesi getirilirken hata:', error);
      return [];
    }
  },
  
  // Tarihe göre randevu listesi
  async tariheGoreGetir(isletmeKimlik: string, tarih: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_id', isletmeKimlik)
        .eq('tarih', tarih);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tarihe göre randevu listesi getirilirken hata:', error);
      return [];
    }
  },
  
  // Personele göre randevu listesi
  async personeleGoreGetir(personelKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('personel_id', personelKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Personele göre randevu listesi getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteriye göre randevu listesi
  async musteriyeGoreGetir(musteriKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('musteri_id', musteriKimlik);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Müşteriye göre randevu listesi getirilirken hata:', error);
      return [];
    }
  },
  
  // Tek randevu getir
  async getir(randevuKimlik: string | number): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('id', randevuKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu getirilirken hata:', error);
      return null;
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
      console.error('Tüm randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Yeni randevu oluştur
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
  async guncelle(randevuKimlik: string | number, randevu: Partial<Randevu>): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(randevu)
        .eq('id', randevuKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu güncellenirken hata:', error);
      return null;
    }
  },
  
  // Randevu sil
  async sil(randevuKimlik: string | number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', randevuKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
      return false;
    }
  },
  
  // İşletmenin randevularını getir (compatibility with older code)
  async isletmeRandevulariniGetir(isletmeId: string): Promise<Randevu[]> {
    return this.isletmeyeGoreGetir(isletmeId);
  },
  
  // Kullanıcının randevularını getir
  async kendiRandevulariniGetir(): Promise<Randevu[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('customer_id', user.id);
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Kullanıcının randevuları getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteri ID'ye göre randevu getir
  async getirByMusteriId(musteriId: string): Promise<Randevu[]> {
    return this.musteriyeGoreGetir(musteriId);
  }
};
