
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSiralama } from '@/components/operations/constants/workingDays';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('*');

    if (error) throw error;
    
    // Sort by our array index instead of object lookup
    return (data || []).sort((a, b) => {
      const aIndex = gunSiralama.indexOf(a.gun);
      const bIndex = gunSiralama.indexOf(b.gun);
      return aIndex - bIndex;
    });
  },
  
  async gunleriGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('gun');

    if (error) throw error;
    
    // Sort by our array index
    return (data || []).sort((a, b) => {
      const aIndex = gunSiralama.indexOf(a.gun);
      const bIndex = gunSiralama.indexOf(b.gun);
      return aIndex - bIndex;
    });
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .upsert(saatler)
      .select();

    if (error) throw error;
    
    // Sort by our array index
    return (data || []).sort((a, b) => {
      const aIndex = gunSiralama.indexOf(a.gun);
      const bIndex = gunSiralama.indexOf(b.gun);
      return aIndex - bIndex;
    });
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
