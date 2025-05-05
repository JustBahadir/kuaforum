
import { supabase } from '../client';
import { IslemKategorisi } from '../types';

export const kategoriServisi = {
  // İşletmeye göre kategorileri getir
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
      console.error('Kategoriler getirilirken hata:', error);
      return [];
    }
  },
  
  // Kategori oluştur
  async olustur(kategori: Partial<IslemKategorisi>): Promise<IslemKategorisi | null> {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([kategori])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as IslemKategorisi;
    } catch (error) {
      console.error('Kategori oluşturulurken hata:', error);
      return null;
    }
  },
  
  // Kategori güncelle
  async guncelle(kategoriKimlik: string, kategori: Partial<IslemKategorisi>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .update(kategori)
        .eq('kimlik', kategoriKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Kategori güncellenirken hata:', error);
      return false;
    }
  },
  
  // Kategori sil
  async sil(kategoriKimlik: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('kimlik', kategoriKimlik);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      return false;
    }
  }
};

