
import { supabase } from '../client';
import { Islem } from '../types';

export const islemServisi = {
  async hepsiniGetir() {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .order('sira', { ascending: true });

      if (error) {
        console.error("İşlemler getirilirken hata oluştu:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("İşlemler getirilirken hata oluştu:", error);
      return [];
    }
  },

  async kategorileriGetir() {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .order('sira', { ascending: true });

      if (error) {
        console.error("İşlem kategorileri getirilirken hata oluştu:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("İşlem kategorileri getirilirken hata oluştu:", error);
      return [];
    }
  },

  async kategoriIslemleriGetir(kategoriId: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .order('sira', { ascending: true });

      if (error) {
        console.error(`Kategori #${kategoriId} işlemleri getirilirken hata oluştu:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Kategori #${kategoriId} işlemleri getirilirken hata oluştu:`, error);
      return [];
    }
  },

  async ekle(islem: { islem_adi: string, fiyat: number, puan: number, kategori_id?: number }) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .insert([islem])
        .select()
        .single();

      if (error) {
        console.error("İşlem eklenirken hata oluştu:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("İşlem eklenirken hata oluştu:", error);
      throw error;
    }
  },

  async guncelle(id: number, updates: Partial<Islem>) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`İşlem #${id} güncellenirken hata oluştu:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`İşlem #${id} güncellenirken hata oluştu:`, error);
      throw error;
    }
  },

  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`İşlem #${id} silinirken hata oluştu:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`İşlem #${id} silinirken hata oluştu:`, error);
      throw error;
    }
  },

  async kategoriEkle(kategori: { kategori_adi: string }) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([kategori])
        .select()
        .single();

      if (error) {
        console.error("Kategori eklenirken hata oluştu:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Kategori eklenirken hata oluştu:", error);
      throw error;
    }
  },

  async kategoriGuncelle(id: number, updates: { kategori_adi: string }) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Kategori #${id} güncellenirken hata oluştu:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Kategori #${id} güncellenirken hata oluştu:`, error);
      throw error;
    }
  },

  async kategoriSil(id: number) {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Kategori #${id} silinirken hata oluştu:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Kategori #${id} silinirken hata oluştu:`, error);
      throw error;
    }
  },

  async siraGuncelle(islemler: Islem[]) {
    try {
      // Loop through the services and update their order
      for (const [index, islem] of islemler.entries()) {
        await supabase
          .from('islemler')
          .update({ sira: index })
          .eq('id', islem.id);
      }
      
      return true;
    } catch (error) {
      console.error("İşlem sırası güncellenirken hata oluştu:", error);
      throw error;
    }
  },

  // Add the missing getirById method
  async getirById(id: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`İşlem #${id} getirilirken hata oluştu:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`İşlem #${id} getirilirken hata oluştu:`, error);
      throw error;
    }
  }
};
