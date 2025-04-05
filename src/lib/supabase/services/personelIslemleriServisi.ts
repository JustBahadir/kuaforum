
import { supabase } from '../client';
import { PersonelIslemi } from '../types';

export const personelIslemleriServisi = {
  async hepsiniGetir(): Promise<PersonelIslemi[]> {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id(*),
          islem:islem_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Personel işlemleri alınırken hata:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Personel işlemleri alınırken hata:", error);
      throw error;
    }
  },

  async personelIslemleriGetirById(personel_id: number): Promise<PersonelIslemi[]> {
    try {
      console.info(`${personel_id} ID'li personel işlemleri alınıyor...`);
      
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          musteri:musteri_id(first_name, last_name),
          islem:islem_id(*)
        `)
        .eq('personel_id', personel_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`${personel_id} ID'li personel işlemleri alınırken hata:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`${personel_id} ID'li personel işlemleri alınırken hata:`, error);
      throw error;
    }
  }
};
