
import { supabase } from '../client';
import { getCurrentDukkanId } from '../utils/getCurrentDukkanId';

export const islemServisi = {
  async getCurrentDukkanId() {
    return getCurrentDukkanId();
  },

  async hepsiniGetir(dukkanId?: number) {
    try {
      let dId = dukkanId;
      if (!dId) {
        dId = await this.getCurrentDukkanId();
      }

      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlemler getirme hatası:', error);
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

  async kategoriIdyeGoreGetir(kategoriId: number, dukkanId?: number) {
    try {
      let dId = dukkanId;
      if (!dId) {
        dId = await this.getCurrentDukkanId();
      }

      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .order('sira', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori işlemleri getirme hatası:', error);
      throw error;
    }
  },

  async ekle(islem: any) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .insert([islem])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },

  async guncelle(id: number, islem: any) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(islem)
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
  }
};
