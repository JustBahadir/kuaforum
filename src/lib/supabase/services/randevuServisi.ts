
import { supabase } from '../client';
import { Randevu } from '../types';
import { musteriServisi } from './musteriServisi';

export const randevuServisi = {
  async hepsiniGetir(dukkanId?: number) {
    try {
      // If dukkanId is not provided, get it from current user
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
  
  async randevuOlustur(randevuVerisi: Partial<Randevu>) {
    try {
      if (!randevuVerisi.dukkan_id) {
        randevuVerisi.dukkan_id = await this.getCurrentDukkanId();
      }
      
      if (!randevuVerisi.dukkan_id) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
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
  
  async randevuGuncelle(id: number, updates: Partial<Randevu>) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  },
  
  async randevuSil(id: number) {
    try {
      const { error } = await supabase
        .from('randevular')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      throw error;
    }
  },
  
  async randevuDurumGuncelle(id: number, durum: string) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .update({ durum })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      throw error;
    }
  },
  
  async musteriRandevulari(musteriId: number) {
    try {
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('musteri_id', musteriId)
        .order('tarih', { ascending: false })
        .order('saat', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Müşteri randevuları getirme hatası:', error);
      throw error;
    }
  },
  
  async tariheGoreGetir(tarih: string | Date) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      // Format date to YYYY-MM-DD
      const formattedDate = typeof tarih === 'string' 
        ? tarih 
        : tarih.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', dukkanId)
        .eq('tarih', formattedDate)
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Tarihe göre randevu getirme hatası:', error);
      throw error;
    }
  },
  
  async tarihGetir(tarih: string | Date) {
    return this.tariheGoreGetir(tarih);
  },

  async kendiRandevulariniGetir(customerFilters = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }
      
      const { data, error } = await supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('customer_id', user.id)
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kendi randevularını getirme hatası:', error);
      throw error;
    }
  },

  async dukkanRandevulariniGetir(filters = null) {
    try {
      const dukkanId = await this.getCurrentDukkanId();
      
      if (!dukkanId) {
        throw new Error('Dükkan bilgisi bulunamadı');
      }
      
      let query = supabase
        .from('randevular')
        .select(`
          *,
          musteri:musteri_id (*),
          personel:personel_id (*)
        `)
        .eq('dukkan_id', dukkanId);
      
      // Apply filters if provided
      if (filters) {
        if (filters.tarih) {
          query = query.eq('tarih', filters.tarih);
        }
        if (filters.durum) {
          query = query.eq('durum', filters.durum);
        }
        if (filters.personel_id) {
          query = query.eq('personel_id', filters.personel_id);
        }
      }
      
      const { data, error } = await query
        .order('tarih', { ascending: true })
        .order('saat', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Dükkan randevularını getirme hatası:', error);
      throw error;
    }
  },

  async durumGuncelle(id: number, durum: string) {
    return this.randevuDurumGuncelle(id, durum);
  },
  
  async getCurrentDukkanId() {
    try {
      return await musteriServisi.getCurrentUserDukkanId();
    } catch (error) {
      console.error('Dükkan ID getirme hatası:', error);
      throw error;
    }
  }
};
