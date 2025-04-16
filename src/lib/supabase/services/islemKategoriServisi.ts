
import { supabase } from "@/integrations/supabase/client";

export const islemKategoriServisi = {
  /**
   * Tüm işlem kategorilerini getirir
   */
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .order('sira');

    if (error) {
      console.error("İşlem kategorileri getirilirken hata oluştu:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Belirli bir kategoriyi id'ye göre getirir
   */
  async getirById(id: number) {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`${id} ID'li kategori getirilirken hata oluştu:`, error);
      throw error;
    }

    return data;
  }
};
