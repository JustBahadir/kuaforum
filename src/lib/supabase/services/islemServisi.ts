
import { supabase } from '../client';
import { Hizmet } from '../types';

export const islemServisi = {
  async kategoriyeGoreGetir(kategoriKimlik: string): Promise<Hizmet[]> {
    try {
      const { data, error } = await supabase
        .from('hizmetler')
        .select('*')
        .eq('kategori_kimlik', kategoriKimlik)
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as Hizmet[];
    } catch (error) {
      console.error('Kategori hizmetleri getirme hatası:', error);
      return [];
    }
  },

  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<Hizmet[]> {
    try {
      const { data, error } = await supabase
        .from('hizmetler')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as Hizmet[];
    } catch (error) {
      console.error('İşletme hizmetleri getirme hatası:', error);
      return [];
    }
  },

  // Tüm hizmetleri getir
  async hepsiniGetir(): Promise<Hizmet[]> {
    try {
      const { data, error } = await supabase
        .from('hizmetler')
        .select('*')
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as Hizmet[];
    } catch (error) {
      console.error('Tüm hizmetleri getirme hatası:', error);
      return [];
    }
  },

  // Tek bir hizmeti ID ile getir
  async getir(hizmetKimlik: string): Promise<Hizmet | null> {
    try {
      const { data, error } = await supabase
        .from('hizmetler')
        .select('*')
        .eq('kimlik', hizmetKimlik)
        .single();
      
      if (error) throw error;
      
      return data as Hizmet;
    } catch (error) {
      console.error('Hizmet getirme hatası:', error);
      return null;
    }
  },

  // Hizmet ekle (ekle method alias for olustur)
  async ekle(islem: Partial<Hizmet>): Promise<Hizmet | null> {
    return this.olustur(islem);
  },

  async olustur(islem: Partial<Hizmet>): Promise<Hizmet | null> {
    try {
      const { data, error } = await supabase
        .from('hizmetler')
        .insert(islem)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Hizmet;
    } catch (error) {
      console.error('Hizmet oluşturma hatası:', error);
      return null;
    }
  },

  async guncelle(islemKimlik: string, islem: Partial<Hizmet>): Promise<Hizmet | null> {
    try {
      const { data, error } = await supabase
        .from('hizmetler')
        .update(islem)
        .eq('kimlik', islemKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Hizmet;
    } catch (error) {
      console.error('Hizmet güncelleme hatası:', error);
      return null;
    }
  },

  async sil(islemKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hizmetler')
        .delete()
        .eq('kimlik', islemKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Hizmet silme hatası:', error);
      return false;
    }
  }
};
