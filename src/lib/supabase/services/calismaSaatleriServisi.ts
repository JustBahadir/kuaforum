import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('*')
      .order('gun', { ascending: true });

    if (error) throw error;
    return data || [];
  },
  
  async gunleriGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('gun')
      .order('gun', { ascending: true });

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
  }
};
