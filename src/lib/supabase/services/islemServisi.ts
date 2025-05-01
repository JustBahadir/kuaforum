
import { supabase } from '../client';
import { IslemDto } from '../types'; 
import { kategorilerServisi } from './kategoriServisi';

export const islemServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      let actualDukkanId = dukkanId;
      
      // If dukkanId is not provided, try to get the current user's dukkan_id
      if (!actualDukkanId) {
        actualDukkanId = await kategorilerServisi.getCurrentUserDukkanId();
      }
      
      if (!actualDukkanId) {
        console.warn('Kullanıcının dükkan bilgisi bulunamadı');
        return [];
      }
      
      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id (
            id,
            kategori_adi
          )
        `)
        .eq('dukkan_id', actualDukkanId)
        .order('sira', { ascending: true });
        
      if (error) {
        console.error('Hizmetleri getirirken hata:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Hizmetleri getirirken hata:', error);
      return [];
    }
  },
  
  async kategoriVeDukkanaGoreGetir(kategoriId: number, dukkanId: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select('*')
        .eq('kategori_id', kategoriId)
        .eq('dukkan_id', dukkanId)
        .order('sira');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategori hizmetlerini getirirken hata:', error);
      return [];
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .select(`
          *,
          kategori:kategori_id (
            id,
            kategori_adi
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`ID: ${id} hizmet getirme hatası:`, error);
      throw error;
    }
  },
  
  async ekle(islem: Partial<IslemDto>) {
    try {
      // If dukkan_id is not provided, get it from the current user
      if (!islem.dukkan_id) {
        const dukkanId = await kategorilerServisi.getCurrentUserDukkanId();
        if (!dukkanId) {
          throw new Error('İşletme bilgisi bulunamadı');
        }
        islem.dukkan_id = dukkanId;
      }
      
      // Set default values if not provided
      const islemData = {
        ...islem,
        sira: islem.sira ?? 0,
        puan: islem.puan ?? 0,
        maliyet: islem.maliyet ?? 0
      };
      
      const { data, error } = await supabase
        .from('islemler')
        .insert(islemData)
        .select();
        
      if (error) {
        console.error('Hizmet ekleme hatası:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Hizmet ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: Partial<IslemDto>) {
    try {
      const { data, error } = await supabase
        .from('islemler')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`ID: ${id} hizmet güncelleme hatası:`, error);
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
      console.error(`ID: ${id} hizmet silme hatası:`, error);
      throw error;
    }
  },
  
  async siralamaGuncelle(islemler: { id: number; sira: number }[]) {
    try {
      // Handle updates one by one to avoid issues with RLS
      const updates = islemler.map((islem) =>
        supabase
          .from('islemler')
          .update({ sira: islem.sira })
          .eq('id', islem.id)
      );
      
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Hizmet sıralama hatası:', error);
      throw error;
    }
  }
};
