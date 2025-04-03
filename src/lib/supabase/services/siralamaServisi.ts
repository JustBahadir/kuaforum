
import { supabase } from '../client';

export const siralamaServisi = {
  async islemSiraGuncelle(islemler: any[]) {
    try {
      for (let i = 0; i < islemler.length; i++) {
        const { error } = await supabase
          .from('islemler')
          .update({ sira: i })
          .eq('id', islemler[i].id);
          
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('İşlem sıralaması güncellenirken hata:', error);
      throw error;
    }
  },
  
  async kategoriSiraGuncelle(kategoriler: any[]) {
    try {
      for (let i = 0; i < kategoriler.length; i++) {
        const { error } = await supabase
          .from('islem_kategorileri')
          .update({ sira: i })
          .eq('id', kategoriler[i].id);
          
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Kategori sıralaması güncellenirken hata:', error);
      throw error;
    }
  }
};
