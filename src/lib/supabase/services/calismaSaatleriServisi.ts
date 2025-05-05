
import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  // İşletmeye göre çalışma saatleri listesi
  async isletmeyeGoreGetir(isletmeKimlik: string): Promise<CalismaSaati[]> {
    try {
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .select('*')
        .eq('isletme_id', isletmeKimlik)
        .order('id', { ascending: true });
      
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
        .select('*');
      
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Tüm çalışma saatleri getirilirken hata:', error);
      return [];
    }
  },
  
  // Çalışma saatleri güncelle veya oluştur
  async guncelle(calismaSaatleri: Partial<CalismaSaati>[]): Promise<CalismaSaati[] | null> {
    try {
      const upserts = calismaSaatleri.map(saat => {
        const { id, ...rest } = saat;
        if (id && !isNaN(Number(id))) {
          return { id, ...rest };
        }
        return rest;
      });
      
      const { data, error } = await supabase
        .from('calisma_saatleri')
        .upsert(upserts)
        .select();
      
      if (error) throw error;
      
      return data as CalismaSaati[];
    } catch (error) {
      console.error('Çalışma saatleri güncellenirken hata:', error);
      return null;
    }
  },
  
  // Toplu güncelleme için yeni fonksiyon
  async topluGuncelle(calismaSaatleri: Partial<CalismaSaati>[]): Promise<CalismaSaati[] | null> {
    return this.guncelle(calismaSaatleri);
  },
  
  // İşletme çalışma saatlerini getir (compatibility with older code)
  async isletmeSaatleriGetir(isletmeId: string): Promise<CalismaSaati[]> {
    return this.isletmeyeGoreGetir(isletmeId);
  },
  
  // İşletmenin saatlerini kaydet (compatibility with older code)
  async saatleriKaydet(saatler: Partial<CalismaSaati>[]): Promise<CalismaSaati[] | null> {
    return this.guncelle(saatler);
  }
};
