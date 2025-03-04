
import { supabase } from "../client";

export const personelIslemleriServisi = {
  personelIslemleriGetir: async (personelId: number) => {
    const { data, error } = await supabase
      .from('personel_islemleri')
      .select(`
        *,
        personel:personel_id(id, ad_soyad),
        islem:islem_id(id, islem_adi, fiyat)
      `)
      .eq('personel_id', personelId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Personel işlemleri alınamadı:", error);
      throw error;
    }
    
    return data || [];
  }
};
