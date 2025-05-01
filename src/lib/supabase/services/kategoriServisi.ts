
import { supabase } from '../client';
import { musteriServisi } from './musteriServisi';

export const kategoriServisi = {
  async getCurrentDukkanId() {
    return musteriServisi.getCurrentUserDukkanId();
  },
  
  async hepsiniGetir(dukkanId?: number) {
    try {
      let shopId = dukkanId;
      if (!shopId) {
        shopId = await this.getCurrentDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori getirme hatası:', error);
      throw error;
    }
  },
  
  async ekle(kategori: any) {
    try {
      if (!kategori.dukkan_id) {
        kategori.dukkan_id = await this.getCurrentDukkanId();
      }
      
      if (!kategori.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Get the current max sira
      const { data: existingItems } = await supabase
        .from('islem_kategorileri')
        .select('sira')
        .eq('dukkan_id', kategori.dukkan_id)
        .order('sira', { ascending: false })
        .limit(1);
      
      const nextSira = existingItems && existingItems.length > 0 ? existingItems[0].sira + 1 : 0;
      
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .insert([{ ...kategori, sira: nextSira }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('islem_kategorileri')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islem_kategorileri')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  },
  
  async sirayiGuncelle(items: any[]) {
    try {
      const updates = items.map(item => ({
        id: item.id,
        sira: item.sira
      }));
      
      const { error } = await supabase
        .from('islem_kategorileri')
        .upsert(updates);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori sıralama güncelleme hatası:', error);
      throw error;
    }
  }
};

export const kategorilerServisi = kategoriServisi;
