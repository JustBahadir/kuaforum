
import { supabase } from '../client';

export const islemKategoriServisi = {
  hepsiniGetir: async () => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .order('sira', { ascending: true });
      
    if (error) {
      console.error("Kategori çekme hatası:", error);
      throw error;
    }
    
    return data || [];
  },
  
  getirById: async (id: number) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Kategori detay çekme hatası:", error);
      throw error;
    }
    
    return data;
  },
  
  ekle: async (kategori: { kategori_adi: string }) => {
    // Get max sira
    const { data: maxSiraData } = await supabase
      .from('islem_kategorileri')
      .select('sira')
      .order('sira', { ascending: false })
      .limit(1);
      
    const nextSira = maxSiraData && maxSiraData.length > 0 ? (maxSiraData[0].sira + 1) : 0;
    
    // Get max id
    const { data: maxIdData } = await supabase
      .from('islem_kategorileri')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
      
    const nextId = maxIdData && maxIdData.length > 0 ? (maxIdData[0].id + 1) : 1;
    
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .insert([
        { 
          id: nextId,
          kategori_adi: kategori.kategori_adi, 
          sira: nextSira 
        }
      ])
      .select();
      
    if (error) {
      console.error("Kategori ekleme hatası:", error);
      throw error;
    }
    
    return data?.[0];
  },
  
  guncelle: async (id: number, kategori: Partial<any>) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .update(kategori)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error("Kategori güncelleme hatası:", error);
      throw error;
    }
    
    return data?.[0];
  },
  
  sil: async (id: number) => {
    const { data, error } = await supabase
      .from('islem_kategorileri')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Kategori silme hatası:", error);
      throw error;
    }
    
    return true;
  }
};
