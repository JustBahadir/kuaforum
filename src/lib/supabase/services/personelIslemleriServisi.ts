
import { supabase } from '../client';
import { musteriServisi } from './musteriServisi';

export const personelIslemleriServisi = {
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
      
      // We join with personel to get only operations from the current shop
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*),
          musteri:musteri_id (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Personel işlemi getirme hatası:', error);
      throw error;
    }
  },
  
  async personelIslemleriniGetir(personelId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*),
          musteri:musteri_id (*)
        `)
        .eq('personel_id', personelId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Personel işlemleri getirme hatası:', error);
      throw error;
    }
  },
  
  async musteriIslemleriniGetir(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .select(`
          *,
          personel:personel_id (*),
          islem:islem_id (*),
          musteri:musteri_id (*)
        `)
        .eq('musteri_id', musteriId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri işlemleri getirme hatası:', error);
      throw error;
    }
  },
  
  async ekle(islem: any) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .insert([islem])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel işlemi ekleme hatası:', error);
      throw error;
    }
  },
  
  async guncelle(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('personel_islemleri')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Personel işlemi güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(id: number) {
    try {
      const { error } = await supabase
        .from('personel_islemleri')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Personel işlemi silme hatası:', error);
      throw error;
    }
  }
};
