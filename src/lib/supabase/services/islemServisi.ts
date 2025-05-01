
import { supabase } from '../client';
import { kategoriServisi } from './kategoriServisi';
import { IslemDto } from '../types';

export const islemServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from the current user
      const shopId = dukkanId || await kategoriServisi.getCurrentUserDukkanId();
      
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
        .order('sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem listesi getirme hatası:', error);
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

  async ekle(islemData: Partial<IslemDto>): Promise<IslemDto> {
    try {
      if (!islemData.dukkan_id) {
        islemData.dukkan_id = await kategoriServisi.getCurrentUserDukkanId();
      }
      
      if (!islemData.dukkan_id) {
        throw new Error('İşletme bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .insert([{
          islem_adi: islemData.islem_adi,
          fiyat: islemData.fiyat || 0,
          maliyet: islemData.maliyet || 0,
          puan: islemData.puan || 0,
          kategori_id: islemData.kategori_id,
          dukkan_id: islemData.dukkan_id,
          sira: islemData.sira || 0
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  async guncelle(id: number, updates: Partial<IslemDto>): Promise<IslemDto> {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
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
      console.error('Sıralama güncelleme hatası:', error);
      throw error;
    }
  },

  async kategoriIleGetir(kategoriId: number) {
    try {
      const dukkanId = await kategoriServisi.getCurrentUserDukkanId();
      
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori ile işlemler getirme hatası:', error);
      throw error;
    }
  }
};
