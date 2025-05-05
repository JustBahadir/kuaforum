
import { supabase } from '../client';
import { Randevu } from '../types';

export const randevuServisi = {
  // İşletmeye göre randevuları getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('isletme_id', isletmeKimlik)
        .order('tarih', { ascending: true });
      
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
        .eq('isletme_id', isletmeKimlik)
        .eq('tarih', tarih)
        .order('saat', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tarihe göre randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Personele göre randevuları getir
  async personeleGoreGetir(personelId: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('personel_id', personelId)
        .order('tarih', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Personele göre randevular getirilirken hata:', error);
      return [];
    }
  },
  
  // Müşteriye göre randevuları getir
  async musteriyeGoreGetir(musteriId: string): Promise<Randevu[]> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Müşteriye göre randevular getirilirken hata:', error);
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
  async guncelle(randevu: Partial<Randevu>): Promise<Randevu | null> {
    try {
      if (!randevu.id && !randevu.kimlik) {
        throw new Error('Randevu ID veya kimlik gereklidir');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .update(randevu)
        .eq(randevu.id ? 'id' : 'kimlik', randevu.id || randevu.kimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu güncellenirken hata:', error);
      return null;
    }
  },

  // Randevu durumu güncelle
  async durumGuncelle(randevuId: string | number, durum: string): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('kimlik', randevuId.toString())
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Randevu;
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata:', error);
      return null;
    }
  },
  
  // Randevu sil
  async sil(randevuId: string | number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', randevuId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Randevu silinirken hata:', error);
      return false;
    }
  },

  // ID'ye göre randevu getir
  async getir(randevuId: string | number): Promise<Randevu | null> {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select('*')
        .eq('id', randevuId)
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
        .select('*')
        .order('tarih', { ascending: true });
      
      if (error) throw error;
      
      return data as Randevu[];
    } catch (error) {
      console.error('Tüm randevular getirilirken hata:', error);
      return [];
    }
  },

  // Müşteri ID'si ile randevuları getir
  async getirByMusteriId(musteriId: string): Promise<Randevu[]> {
    return this.musteriyeGoreGetir(musteriId);
  }
};
