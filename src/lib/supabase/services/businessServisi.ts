
import { supabase } from '../client';

export const businessServisi = {
  async temizleYeniIsletmeVerileri(dukkanId: number) {
    try {
      // Delete any default personnel data
      await supabase
        .from('personel')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      // Delete any default services data
      await supabase
        .from('islemler')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      // Delete any default categories
      await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      // Delete any default appointments
      await supabase
        .from('randevular')
        .delete()
        .eq('dukkan_id', dukkanId);
      
      return true;
    } catch (error) {
      console.error('İşletme verilerini temizleme hatası:', error);
      throw error;
    }
  }
};
