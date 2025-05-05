
import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  // İşletmeye göre çalışma saatlerini getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('isletme_id', isletmeKimlik)
        .order('id');
      
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Tüm çalışma saatlerini getir
  async hepsiniGetir(): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .order('id');
      
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Tek bir saat kaydını kimliğine göre getir
  async getir(saatId: string): Promise<CalismaSaati | null> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('id', saatId)
        .single();
      
      if (error) throw error;
      
      return data as CalismaSaati;
    } catch (error) {
      console.error('Çalışma saati getirilirken hata:', error);
      return null;
    }
  },
  
  // Toplu çalışma saati güncelleme
  async topluGuncelle(saatler: Partial<CalismaSaati>[]): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(saatler)
        .select();
      
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri güncellenirken hata:', error);
      return [];
    }
  },
  
  // Tek bir saat kaydını güncelle
  async guncelle(saatId: string, saat: Partial<CalismaSaati>): Promise<CalismaSaati | null> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(saat)
        .eq('id', saatId)
        .single();
      
      if (error) throw error;
      
      return data as CalismaSaati;
    } catch (error) {
      console.error('Çalışma saati güncellenirken hata:', error);
      return null;
    }
  },
  
  // Yeni saat kaydı oluştur
  async olustur(saat: Partial<CalismaSaati>): Promise<CalismaSaati | null> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saat)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as CalismaSaati;
    } catch (error) {
      console.error('Çalışma saati oluşturulurken hata:', error);
      return null;
    }
  },

  // Geriye dönük uyumluluk için eski fonksiyon isimleri
  async dukkanSaatleriGetir(isletmeId: string) {
    return this.isletmeyeGoreGetir(isletmeId);
  },

  async saatleriKaydet(saatler: Partial<CalismaSaati>[]) {
    return this.topluGuncelle(saatler);
  }
};
