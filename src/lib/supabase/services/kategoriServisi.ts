
import { supabase } from '../client';
import { getCurrentDukkanId } from '../utils/getCurrentDukkanId';

export const kategoriServisi = {
  async getCurrentDukkanId() {
    return getCurrentDukkanId();
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      let dId = dukkanId;
      
      // Get current dukkan ID if not provided
      if (!dId) {
        dId = await this.getCurrentDukkanId();
        if (!dId) {
          console.error('getCurrentDukkanId returned null');
          throw new Error('İşletme bilgisi bulunamadı');
        }
      }
      
      console.log('Getting categories for dukkanId:', dId);

      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .order('sira', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched:', data ? data.length : 0);
      return data || [];
    } catch (error) {
      console.error('Kategori listesi getirme hatası:', error);
      throw error;
    }
  },

  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori getirme hatası:', error);
      throw error;
    }
  },

  async ekle(kategori: any) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([kategori])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },

  async guncelle(id: number, kategori: any) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(kategori)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  }
};
