
import { supabase } from '../client';
import { musteriServisi } from './musteriServisi';

export const islemServisi = {
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
        .from('islemler')
        .select('*')
        .eq('dukkan_id', shopId)
        .order('sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem getirme hatası:', error);
      throw error;
    }
  },
  
  async kategoriIslemleriniGetir(kategoriId: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .order('sira', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori işlemlerini getirme hatası:', error);
      throw error;
    }
  },
  
  async ekle(islem: any) {
    try {
      if (!islem.dukkan_id) {
        islem.dukkan_id = await this.getCurrentDukkanId();
      }
      
      if (!islem.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Get the current max sira
      const { data: existingItems } = await supabase
        .from('islemler')
        .select('sira')
        .eq('kategori_id', islem.kategori_id)
        .order('sira', { ascending: false })
        .limit(1);
      
      const nextSira = existingItems && existingItems.length > 0 ? existingItems[0].sira + 1 : 0;
      
      const { data, error } = await supabase
        .from('islemler')
        .insert([{ ...islem, sira: nextSira }])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('İşlem güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('islemler')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
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
        .from('islemler')
        .upsert(updates);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('İşlem sıralama güncelleme hatası:', error);
      throw error;
    }
  }
};
