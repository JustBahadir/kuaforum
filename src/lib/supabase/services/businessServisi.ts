
import { supabase } from '../client';

export const businessServisi = {
  async temizleYeniIsletmeVerileri(dukkanId: number) {
    try {
      console.log('Cleaning business data for dukkanId:', dukkanId);
      
      // Delete any default personnel data
      await supabase
        .from('personel')
        .delete()
        .eq('dukkan_id', dukkanId);
      console.log('Personel verileri temizlendi');
      
      // Delete any default services data
      await supabase
        .from('islemler')
        .delete()
        .eq('dukkan_id', dukkanId);
      console.log('İşlem verileri temizlendi');
      
      // Delete any default categories
      await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('dukkan_id', dukkanId);
      console.log('Kategori verileri temizlendi');
      
      // Delete any default appointments
      await supabase
        .from('randevular')
        .delete()
        .eq('dukkan_id', dukkanId);
      console.log('Randevu verileri temizlendi');
      
      return true;
    } catch (error) {
      console.error('İşletme verilerini temizleme hatası:', error);
      throw error;
    }
  }
};
