
import { supabase } from '../client';
import { Islem } from '../types';

export const islemServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlemleri getirme hatası:', error);
      throw error;
    }
  },

  async islemEkle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    try {
      // Get the max sira value for the category
      const query = supabase
        .from('islemler')
        .select('sira');
        
      if (islem.kategori_id) {
        query.eq('kategori_id', islem.kategori_id);
      } else {
        query.is('kategori_id', null);
      }
      
      const { data: maxSiraData, error: maxSiraError } = await query
        .order('sira', { ascending: false })
        .limit(1);
      
      if (maxSiraError) throw maxSiraError;
      
      const maxSira = maxSiraData && maxSiraData.length > 0 ? maxSiraData[0].sira || 0 : 0;
      
      const { data, error } = await supabase
        .from('islemler')
        .insert([{
          ...islem,
          sira: maxSira + 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  async ekle(islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    return this.islemEkle(islem);
  },

  async islemGuncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(islem)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem güncelleme hatası:', error);
      throw error;
    }
  },

  async guncelle(id: number, islem: { islem_adi: string; fiyat: number; puan: number; kategori_id?: number }) {
    return this.islemGuncelle(id, islem);
  },

  async islemSil(id: number) {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  },

  async sil(id: number) {
    return this.islemSil(id);
  },

  async siraGuncelle(islemler: Islem[]) {
    try {
      // Update each item with its new position
      const updates = islemler.map((islem, index) => ({
        id: islem.id,
        sira: index
      }));

      const { data, error } = await supabase
        .from('islemler')
        .upsert(updates)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem sıralama hatası:', error);
      throw error;
    }
  }
};
