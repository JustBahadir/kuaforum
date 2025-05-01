
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
        .select(`
          *,
          kategori:kategori_id (id, kategori_adi)
        `)
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
        .select(`
          *,
          kategori:kategori_id (id, kategori_adi)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem getirme hatası:', error);
      throw error;
    }
  },
  
  async kategoriIdyeGoreGetir(kategoriId: number, dukkanId?: number) {
    try {
      let shopId = dukkanId;
      if (!shopId) {
        shopId = await this.getCurrentDukkanId();
      }
      
      let query = supabase
        .from('islemler')
        .select(`*`)
        .eq('kategori_id', kategoriId);
      
      if (shopId) {
        query = query.eq('dukkan_id', shopId);
      }
      
      const { data, error } = await query.order('sira', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategoriye göre işlem getirme hatası:', error);
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
      
      // Get the current max sira for the category
      const { data: existingItems } = await supabase
        .from('islemler')
        .select('sira')
        .eq('kategori_id', islem.kategori_id)
        .eq('dukkan_id', islem.dukkan_id)
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
  
  async siralamaGuncelle(items: any[]) {
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
  },
  
  async personelIslemleriGetir(personelId: number | null = null, filters: any = {}) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      let query = supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*),
          musteri:musteri_id (*)
        `);
      
      if (personelId) {
        query = query.eq('personel_id', personelId);
      }
      
      // Apply date filters if provided
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }
  }
};
