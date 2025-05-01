
import { supabase } from '../client';
import { RandevuDurumu } from '../types';
import { musteriServisi } from './musteriServisi';

export const randevuServisi = {
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
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', shopId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Randevu listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async tariheGoreGetir(tarih: string) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', dukkanId)
        .eq('tarih', tarih)
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tarihe göre randevu listesi getirme hatası:', error);
      throw error;
    }
  },
  
  async getir(id: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Randevu getirme hatası:', error);
      throw error;
    }
  },
  
  async kendiRandevulariniGetir(userId?: string | null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const actualUserId = userId || user?.id;
      
      if (!actualUserId) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('customer_id', actualUserId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kendi randevularını getirme hatası:', error);
      throw error;
    }
  },
  
  async dukkanRandevulariniGetir(dukkanId?: number | null) {
    try {
      let shopId = dukkanId;
      if (shopId === null) {
        shopId = await this.getCurrentDukkanId();
      }
      
      if (!shopId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', shopId)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Dükkan randevuları getirme hatası:', error);
      throw error;
    }
  },
  
  async randevuOlustur(randevuVerisi: any) {
    try {
      if (!randevuVerisi.dukkan_id) {
        randevuVerisi.dukkan_id = await this.getCurrentDukkanId();
      }
      
      if (!randevuVerisi.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Get user from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !randevuVerisi.customer_id) {
        randevuVerisi.customer_id = user.id;
      }
      
      // Convert islem_id to array for islemler field
      if (randevuVerisi.islem_id && !randevuVerisi.islemler) {
        randevuVerisi.islemler = [randevuVerisi.islem_id.toString()];
      }
      
      // Remove islem_id as it's not a column in the table
      delete randevuVerisi.islem_id;
      
      const { data, error } = await supabase
        .from('randevular')
        .insert([randevuVerisi])
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  },
  
  async durumGuncelle(randevuId: number, yeniDurum: RandevuDurumu) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum: yeniDurum })
        .eq('id', randevuId)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu durumu güncelleme hatası:', error);
      throw error;
    }
  },

  async guncelle(randevuId: number, guncellemeler: any) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(guncellemeler)
        .eq('id', randevuId)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  },
  
  async sil(randevuId: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', randevuId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  }
};
