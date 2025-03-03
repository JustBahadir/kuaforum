
import { supabase } from '../client';
import { CalismaSaati } from '../types';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || [];
  },

  async ekle(calismaSaati: Omit<CalismaSaati, 'id'>) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .insert([calismaSaati])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async guncelle(id: number, calismaSaati: Partial<CalismaSaati>) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .update(calismaSaati)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sil(id: number) {
    const { error } = await supabase
      .from('calisma_saatleri')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
