
import { supabase } from '../client';
import { KategoriDto } from '../types';

// This export name must be 'kategorilerServisi' to match imports
export const kategorilerServisi = {
  async hepsiniGetir(dukkanId: number) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', dukkanId)
        .order('sira', { ascending: true });
      
      if (error) {
        console.error('Kategoriler getirilemedi:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      throw error;
    }
  },
  
  async ekle(kategori: Omit<KategoriDto, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([kategori])
        .select();
      
      if (error) {
        console.error('Kategori eklenemedi:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: Partial<KategoriDto>) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Kategori güncellenemedi:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Kategori güncellenemedi:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Kategori silinemedi:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      throw error;
    }
  },
  
  async siralamaGuncelle(kategoriler: KategoriDto[]) {
    try {
      const updates = kategoriler.map(item => ({
        id: item.id,
        sira: item.sira
      }));
      
      // Update each kategori's order
      for (const update of updates) {
        const { error } = await supabase
          .from('islem_kategorileri')
          .update({ sira: update.sira })
          .eq('id', update.id);
        
        if (error) {
          console.error('Kategori sıralaması güncellenemedi:', error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Kategori sıralaması güncellenemedi:', error);
      throw error;
    }
  }
};

// For backward compatibility with any potential older imports
export const kategoriServisi = kategorilerServisi;
