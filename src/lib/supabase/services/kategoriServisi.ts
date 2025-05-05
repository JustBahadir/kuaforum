
import { supabase } from '../client';

export const kategoriServisi = {
  getir: async (id: string) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  hepsiniGetir: async () => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .order('sira', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  isletmeyeGoreGetir: async (isletmeId: string) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('dukkan_id', isletmeId)
      .order('sira', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },
  
  ekle: async (kategori: any) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .insert([kategori])
      .select();
      
    if (error) throw error;
    return data?.[0];
  },
  
  guncelle: async (id: string, kategori: any) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .update(kategori)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data?.[0];
  },
  
  sil: async (id: string) => {
    const { error } = await supabase
      .from('islem_kategorileri')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },
  
  // Added the olustur function (alias for ekle)
  olustur: async (kategori: any) => {
    return kategoriServisi.ekle(kategori);
  },
  
  // Function to update the order of categories
  sirayiGuncelle: async (categories: { id: string, sira: number }[]) => {
    // Prepare the updates for a batch operation
    const updates = categories.map(category => ({
      id: category.id,
      sira: category.sira
    }));
    
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .upsert(updates)
      .select();
      
    if (error) throw error;
    return data;
  }
};
