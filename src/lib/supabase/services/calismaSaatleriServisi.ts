
import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('*');

    if (error) throw error;
    return data || [];
  },
  
  async gunleriGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('gun');

    if (error) throw error;
    return data || [];
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .upsert(saatler)
      .select();

    if (error) throw error;
    return data || [];
  },
  
  async ekle(saat: Omit<CalismaSaati, "id">) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .insert([saat])
      .select();

    if (error) throw error;
    return data[0];
  }
};
