
import { supabase } from '../client';
import { CalismaSaati } from '../types';
import { gunSirasi } from '@/components/operations/constants/workingDays';

export const calismaSaatleriServisi = {
  async hepsiniGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('*');

    if (error) throw error;
    
    // Sort by our custom day order
    return (data || []).sort((a, b) => {
      const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
      const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
      return aIndex - bIndex;
    });
  },
  
  async gunleriGetir() {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .select('gun');

    if (error) throw error;
    
    // Sort by our custom day order
    return (data || []).sort((a, b) => {
      const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
      const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
      return aIndex - bIndex;
    });
  },
  
  async guncelle(saatler: CalismaSaati[]) {
    const { data, error } = await supabase
      .from('calisma_saatleri')
      .upsert(saatler)
      .select();

    if (error) throw error;
    
    // Sort by our custom day order
    return (data || []).sort((a, b) => {
      const aIndex = gunSirasi[a.gun as keyof typeof gunSirasi] || 99;
      const bIndex = gunSirasi[b.gun as keyof typeof gunSirasi] || 99;
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
