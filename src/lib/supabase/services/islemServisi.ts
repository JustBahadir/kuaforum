
import { supabase } from '../client';
import { kategoriServisi } from './kategoriServisi';

export const islemServisi = {
  // Get current user's dukkan ID - use the same method from kategoriServisi
  getCurrentUserDukkanId: kategoriServisi.getCurrentUserDukkanId,

  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from the current user
      const shopId = dukkanId || await this.getCurrentUserDukkanId();
      
      if (!shopId) {
        throw new Error('İşletme bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id (
            id,
            kategori_adi
          )
        `)
        .eq('dukkan_id', shopId)
        .order('sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem listesi getirme hatası:', error);
      throw error;
    }
  },

  async kategoriIslemleriGetir(kategoriId: number, dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from the current user
      const shopId = dukkanId || await this.getCurrentUserDukkanId();
      
      if (!shopId) {
        throw new Error('İşletme bilgisi bulunamadı');
      }

      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .eq('dukkan_id', shopId)
        .order('sira');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori işlemleri getirme hatası:', error);
      throw error;
    }
  },

  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem getirme hatası:', error);
      throw error;
    }
  },

  async ekle(islem: {
    islem_adi: string, 
    fiyat: number, 
    maliyet?: number, 
    puan: number, 
    kategori_id: number | null, 
    dukkan_id?: number,
    sira?: number
  }) {
    try {
      if (!islem.dukkan_id) {
        // Get the current user's dukkan_id if not provided
        islem.dukkan_id = await this.getCurrentUserDukkanId();
      }
      
      if (!islem.dukkan_id) {
        throw new Error('İşletme bilgisi bulunamadı');
      }

      // If sira is not provided, get the count of islemler for the category
      if (islem.sira === undefined) {
        const { count, error: countError } = await supabase
          .from('islemler')
          .select('id', { count: 'exact' })
          .eq('kategori_id', islem.kategori_id)
          .eq('dukkan_id', islem.dukkan_id);

        if (countError) throw countError;
        islem.sira = count || 0;
      }

      const { data, error } = await supabase
        .from('islemler')
        .insert([{
          islem_adi: islem.islem_adi,
          fiyat: islem.fiyat,
          maliyet: islem.maliyet || 0,
          puan: islem.puan,
          kategori_id: islem.kategori_id,
          dukkan_id: islem.dukkan_id,
          sira: islem.sira
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

  async guncelle(id: number, updates: Partial<{
    islem_adi: string,
    fiyat: number,
    maliyet: number,
    puan: number,
    kategori_id: number,
    sira: number
  }>) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
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

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  },

  async siralamaGuncelle(items: {id: number, sira: number}[]) {
    try {
      for (const item of items) {
        const { error } = await supabase
          .from('islemler')
          .update({ sira: item.sira })
          .eq('id', item.id);

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('İşlem sıralama güncelleme hatası:', error);
      throw error;
    }
  }
};
