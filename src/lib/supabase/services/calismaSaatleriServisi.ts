
import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  // Çalışma saatlerini işletmeye göre getir
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('isletme_id', isletmeKimlik);
        
      if (error) throw error;
      
      // Verileri CalismaSaati tipine dönüştür
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri getirme hatası:', error);
      throw error;
    }
  },

  // Tüm çalışma saatlerini getir
  async hepsiniGetir(): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*');
        
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Tüm çalışma saatlerini getirme hatası:', error);
      throw error;
    }
  },
  
  // Özel bir çalışma saati getir
  async getir(saatId: string): Promise<CalismaSaati> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('id', saatId)
        .single();
        
      if (error) throw error;
      
      return data as CalismaSaati;
    } catch (error) {
      console.error('Çalışma saati getirme hatası:', error);
      throw error;
    }
  },
  
  // Çalışma saatlerini toplu olarak güncelle
  async topluGuncelle(saatler: Partial<CalismaSaati>[]): Promise<CalismaSaati[]> {
    try {
      // İsletme_id alanına göre çalışma saatlerini güncelle
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(saatler)
        .select();
        
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatlerini güncelleme hatası:', error);
      throw error;
    }
  },
  
  // Tek bir çalışma saatini güncelle
  async guncelle(saatId: string, saat: Partial<CalismaSaati>): Promise<CalismaSaati> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .update(saat)
        .eq('id', saatId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data as CalismaSaati;
    } catch (error) {
      console.error('Çalışma saati güncelleme hatası:', error);
      throw error;
    }
  },
  
  // Çalışma saati oluştur
  async olustur(saat: Partial<CalismaSaati>): Promise<CalismaSaati> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .insert(saat)
        .select()
        .single();
        
      if (error) throw error;
      
      return data as CalismaSaati;
    } catch (error) {
      console.error('Çalışma saati oluşturma hatası:', error);
      throw error;
    }
  }
};
