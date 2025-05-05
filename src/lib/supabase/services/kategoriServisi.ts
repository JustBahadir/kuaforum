
import { supabase } from '../client';
import { IslemKategorisi } from '../types';

export const kategoriServisi = {
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<IslemKategorisi[]> {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('isletme_kimlik', isletmeKimlik)
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as IslemKategorisi[];
    } catch (error) {
      console.error('İşletme kategorileri getirme hatası:', error);
      return [];
    }
  },

  // Tüm kategorileri getir
  async hepsiniGetir(): Promise<IslemKategorisi[]> {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .order('siralama', { ascending: true });
      
      if (error) throw error;
      
      return data as IslemKategorisi[];
    } catch (error) {
      console.error('Tüm kategorileri getirme hatası:', error);
      return [];
    }
  },

  async olustur(kategori: Partial<IslemKategorisi>): Promise<IslemKategorisi | null> {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert(kategori)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as IslemKategorisi;
    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      return null;
    }
  },

  async guncelle(kategoriKimlik: string, kategori: Partial<IslemKategorisi>): Promise<IslemKategorisi | null> {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(kategori)
        .eq('kimlik', kategoriKimlik)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as IslemKategorisi;
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      return null;
    }
  },

  async sil(kategoriKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('kimlik', kategoriKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      return false;
    }
  }
};
